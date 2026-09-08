import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PrintIcon from "@mui/icons-material/Print";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankJob = {
  jobid: "",
  title: "",
  department: "",
  location: "",
  employmenttype: "",
  openings: 1,
  salaryrange: "",
  description: "",
  eligibility: "",
  skills: "",
  formid: "",
  status: "Draft",
  lastdate: ""
};

const blankField = {
  fieldname: "",
  label: "",
  fieldtype: "Text",
  options: "",
  isrequired: "No",
  page: "Page 1",
  section: "Additional details",
  order: 0
};

const blankCandidateStatus = { status: "", description: "", isactive: "Yes" };
const blankApprovalLevel = { jobid: "", level: 1, approverrole: "", approvername: "", approveremail: "", description: "", isactive: "Yes" };

const fieldTypes = ["Text", "Textarea", "Number", "Date", "Email", "Phone", "Select", "Radio", "Checkbox", "File", "Photo"];
const yesNo = ["Yes", "No"];
const employmentTypes = [
  "Full time",
  "Part time",
  "Full time Hybrid",
  "Part time Hybrid",
  "Full time work from home",
  "Part Time Work From home",
  "Contractual"
];

export default function RecruitmentManagementPage() {
  const [tab, setTab] = useState(0);
  const [forms, setForms] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [fields, setFields] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [candidateStatuses, setCandidateStatuses] = useState([]);
  const [approvalLevels, setApprovalLevels] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [formData, setFormData] = useState({
    formid: "",
    title: "",
    description: "",
    isactive: "Yes",
    includeeducationpanel: "No",
    includefamilypanel: "No",
    includeemploymentpanel: "No",
    includedocumentpanel: "No"
  });
  const [jobData, setJobData] = useState(blankJob);
  const [fieldData, setFieldData] = useState(blankField);
  const [docData, setDocData] = useState({ documenttype: "", description: "", isrequired: "No" });
  const [statusData, setStatusData] = useState(blankCandidateStatus);
  const [approvalData, setApprovalData] = useState(blankApprovalLevel);
  const [approvalComments, setApprovalComments] = useState("");
  const [criteria, setCriteria] = useState({ mandatorycriteria: "", validationcriteria: "" });
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [confirmationMail, setConfirmationMail] = useState({ subject: "Recruitment confirmation", body: "" });
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const colid = global1.colid;

  const loadForms = async () => {
    const res = await ep1.get("/api/v2/recruitment/forms", { params: { colid } });
    setForms(res.data || []);
    if (!selectedForm && res.data?.[0]?.formid) setSelectedForm(res.data[0].formid);
  };

  const loadJobs = async () => {
    const res = await ep1.get("/api/v2/recruitment/jobs", { params: { colid } });
    setJobs(res.data || []);
    if (!selectedJob && res.data?.[0]?.jobid) setSelectedJob(res.data[0].jobid);
  };

  const loadFields = async (formid = selectedForm) => {
    if (!formid) return setFields([]);
    const res = await ep1.get("/api/v2/recruitment/fields", { params: { colid, formid } });
    setFields(res.data || []);
  };

  const loadDocuments = async (formid = selectedForm) => {
    if (!formid) return setDocuments([]);
    const res = await ep1.get("/api/v2/recruitment/documents", { params: { colid, formid } });
    setDocuments(res.data || []);
  };

  const loadCandidateStatuses = async () => {
    const res = await ep1.get("/api/v2/recruitment/candidate-statuses", { params: { colid } });
    setCandidateStatuses(res.data || []);
  };

  const loadApprovalLevels = async (jobid = selectedJob) => {
    const params = { colid };
    if (jobid) params.jobid = jobid;
    const res = await ep1.get("/api/v2/recruitment/approval-levels", { params });
    setApprovalLevels(res.data || []);
  };

  const loadCriteria = async (formid = selectedForm) => {
    if (!formid) return setCriteria({ mandatorycriteria: "", validationcriteria: "" });
    const res = await ep1.get("/api/v2/recruitment/validation", { params: { colid, formid } });
    setCriteria({
      formname: res.data?.formname || forms.find((item) => item.formid === formid)?.title || "",
      mandatorycriteria: res.data?.mandatorycriteria || "",
      validationcriteria: res.data?.validationcriteria || ""
    });
  };

  const loadApplications = async (jobid = selectedJob) => {
    if (!jobid) return setApplications([]);
    const res = await ep1.get("/api/v2/recruitment/applications", { params: { colid, jobid } });
    setApplications(res.data || []);
  };

  useEffect(() => {
    Promise.all([loadForms(), loadJobs(), loadCandidateStatuses()]).catch((err) => setError(err.response?.data?.msg || err.message));
  }, []);

  useEffect(() => {
    loadFields();
    loadDocuments();
    loadCriteria();
  }, [selectedForm]);

  useEffect(() => {
    loadApplications();
    loadApprovalLevels();
  }, [selectedJob]);

  const saveForm = async () => {
    setError("");
    const res = await ep1.post("/api/v2/recruitment/forms", { ...formData, colid, user: global1.user });
    setMessage("Recruitment form saved");
    setSelectedForm(res.data.formid);
    setFormData({
      formid: "",
      title: "",
      description: "",
      isactive: "Yes",
      includeeducationpanel: "No",
      includefamilypanel: "No",
      includeemploymentpanel: "No",
      includedocumentpanel: "No"
    });
    await loadForms();
  };

  const saveJob = async () => {
    setError("");
    const payload = { ...jobData, colid, user: global1.user, createdByName: global1.name };
    const res = await ep1.post("/api/v2/recruitment/jobs", payload);
    setMessage("Job post saved");
    setSelectedJob(res.data.jobid);
    setJobData(blankJob);
    await loadJobs();
  };

  const saveField = async () => {
    if (!selectedForm) return setError("Select a form first");
    await ep1.post("/api/v2/recruitment/fields", { ...fieldData, colid, formid: selectedForm });
    setMessage("Field saved");
    setFieldData(blankField);
    await loadFields();
  };

  const saveDocument = async () => {
    if (!selectedForm) return setError("Select a form first");
    await ep1.post("/api/v2/recruitment/documents", { ...docData, colid, formid: selectedForm });
    setMessage("Document type saved");
    setDocData({ documenttype: "", description: "", isrequired: "No" });
    await loadDocuments();
  };

  const saveCandidateStatus = async () => {
    if (!statusData.status.trim()) return setError("Status is required");
    await ep1.post("/api/v2/recruitment/candidate-statuses", { ...statusData, colid, user: global1.user });
    setMessage("Candidate status saved");
    setStatusData(blankCandidateStatus);
    await loadCandidateStatuses();
  };

  const saveApprovalLevel = async () => {
    if (!approvalData.jobid) return setError("Select a job first");
    const job = jobs.find((item) => item.jobid === approvalData.jobid);
    await ep1.post("/api/v2/recruitment/approval-levels", {
      ...approvalData,
      jobtitle: job?.title || approvalData.jobid,
      colid,
      user: global1.user
    });
    setMessage("Approval level saved");
    setApprovalData({ ...blankApprovalLevel, jobid: approvalData.jobid });
    await loadApprovalLevels(selectedJob);
  };

  const saveCriteria = async () => {
    if (!selectedForm) return setError("Select a form first");
    await ep1.post("/api/v2/recruitment/validation", { ...criteria, colid, formid: selectedForm, formname: forms.find((f) => f.formid === selectedForm)?.title || selectedForm });
    setMessage("Validation criteria saved");
    await loadCriteria();
  };

  const deleteBy = async (url, payload, reload) => {
    await ep1.post(url, { ...payload, colid });
    setMessage("Deleted");
    await reload();
  };

  const shareLink = (job) => `${window.location.origin}/recruitment-apply?colid=${job.colid}&jobid=${encodeURIComponent(job.jobid)}${job.sharetoken ? `&token=${encodeURIComponent(job.sharetoken)}` : ""}`;

  const copyText = async (text) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setMessage("Share link copied");
    } catch (err) {
      setError("Unable to copy link. Please open the link and copy from the address bar.");
    }
  };

  const copyShareLink = async (job) => {
    const link = shareLink(job);
    await copyText(link);
  };

  const publishAndCopyShareLink = async (job) => {
    try {
      setError("");
      const res = await ep1.post("/api/v2/recruitment/jobs", {
        ...job,
        id: job._id,
        colid,
        status: "Posted",
        user: global1.user,
        createdByName: global1.name
      });
      const updatedJob = res.data || { ...job, status: "Posted" };
      await loadJobs();
      await copyShareLink(updatedJob);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to generate share link");
    }
  };

  const candidateFields = useMemo(() => {
    const fixed = ["applicantname", "email", "phone", "status", "validationstatus"];
    const custom = new Set();
    applications.forEach((app) => Object.keys(app.customfields || {}).forEach((key) => custom.add(key)));
    return [...fixed, ...Array.from(custom).sort()];
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const value = filterValue.toLowerCase();
    const search = textSearch.toLowerCase();
    return applications.filter((app) => {
      const allText = JSON.stringify(app).toLowerCase();
      const fieldValue = String(app[filterField] ?? app.customfields?.[filterField] ?? "").toLowerCase();
      return (!filterField || !value || fieldValue.includes(value)) && (!search || allText.includes(search));
    });
  }, [applications, filterField, filterValue, textSearch]);

  const selectedJobInfo = useMemo(() => jobs.find((job) => job.jobid === selectedJob) || {}, [jobs, selectedJob]);

  const candidateSampleMail = (candidate) => {
    const candidateName = candidate?.applicantname || "Candidate";
    const jobTitle = selectedJobInfo.title || selectedJob || "the applied position";
    return `Dear ${candidateName},

Greetings from ${global1.insname || "the institution"}.

We are pleased to inform you that your candidature for ${jobTitle} has been confirmed.

Please keep this email for your records. Further joining formalities and required documents will be communicated separately.

Regards,
${global1.name || "Recruitment Team"}`;
  };

  const safeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));

  const asText = (value) => Array.isArray(value) ? value.join(", ") : String(value ?? "");
  const experienceMonthsBetween = (start, end) => {
    const from = new Date(start);
    const to = new Date(end);
    if (!start || !end || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return 0;
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (to.getDate() >= from.getDate()) months += 1;
    return Math.max(0, months);
  };
  const formatExperienceMonths = (months) => {
    const safeMonths = Math.max(0, Number(months || 0));
    const years = Math.floor(safeMonths / 12);
    const remaining = safeMonths % 12;
    if (years && remaining) return `${years} year${years === 1 ? "" : "s"} ${remaining} month${remaining === 1 ? "" : "s"}`;
    if (years) return `${years} year${years === 1 ? "" : "s"}`;
    if (remaining) return `${remaining} month${remaining === 1 ? "" : "s"}`;
    return "";
  };
  const candidateTotalExperience = (candidate) => candidate?.totalexperience || formatExperienceMonths((candidate?.pastemployments || []).reduce((sum, row) => sum + experienceMonthsBetween(row.dateofjoining, row.lastworkingdate), 0));

  const tableHtml = (title, rows = [], columns = []) => {
    const bodyRows = rows.length ? rows : [{}];
    return `
      <section>
        <h3>${safeHtml(title)}</h3>
        <table>
          <thead><tr>${columns.map((col) => `<th>${safeHtml(col.label)}</th>`).join("")}</tr></thead>
          <tbody>
            ${bodyRows.map((row) => `<tr>${columns.map((col) => {
              const value = asText(row[col.name]);
              return `<td>${col.link && value ? `<a href="${safeHtml(value)}">${safeHtml(value)}</a>` : safeHtml(value || "-")}</td>`;
            }).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </section>
    `;
  };

  const printCandidateProfile = (candidate) => {
    if (!candidate) return;
    const job = jobs.find((item) => item.jobid === candidate.jobid) || selectedJobInfo || {};
    const photo = candidate.photourl || candidate.documents?.find((doc) => /photo/i.test(doc.documenttype || ""))?.url || "";
    const customRows = Object.entries(candidate.customfields || {}).map(([field, value]) => ({ field, value: asText(value) }));
    const standardDocs = (candidate.documents || []).map((doc) => ({ documenttype: doc.documenttype, link: doc.url || doc.link || "" }));
    const html = `
      <!doctype html>
      <html>
        <head>
          <title>Candidate Profile</title>
          <style>
            @page { size: A4; margin: 10mm; }
            * { box-sizing: border-box; }
            body { margin: 0; color: #111; font-family: Arial, sans-serif; font-size: 11px; }
            .sheet { width: 190mm; min-height: 277mm; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; gap: 12px; border-bottom: 2px solid #111; padding-bottom: 8px; }
            .logo { width: 58px; height: 58px; object-fit: contain; }
            .photo { width: 76px; height: 92px; object-fit: cover; border: 1px solid #111; }
            h1 { margin: 0; font-size: 17px; }
            h2 { margin: 2px 0 0; font-size: 13px; }
            h3 { margin: 9px 0 4px; font-size: 12px; padding: 3px 5px; background: #eef2f7; border-left: 3px solid #111; }
            .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3px 12px; margin-top: 8px; }
            .meta div { border-bottom: 1px dotted #aaa; padding-bottom: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 5px; table-layout: fixed; }
            th, td { border: 1px solid #999; padding: 3px 4px; vertical-align: top; word-break: break-word; }
            th { background: #f3f4f6; text-align: left; font-weight: 700; }
            a { color: #111; text-decoration: underline; }
            .footer { margin-top: 12px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header">
              <div style="display:flex;gap:10px;align-items:flex-start">
                ${global1.logo ? `<img class="logo" src="${safeHtml(global1.logo)}" />` : ""}
                <div>
                  <h1>${safeHtml(global1.insname || "Institution")}</h1>
                  <div>${safeHtml(global1.address || "")}</div>
                  <h2>Recruitment Candidate Profile</h2>
                </div>
              </div>
              ${photo ? `<img class="photo" src="${safeHtml(photo)}" />` : `<div class="photo"></div>`}
            </div>
            <h3>Job details</h3>
            <div class="meta">
              <div><b>Job:</b> ${safeHtml(job.title || candidate.jobid || "")}</div>
              <div><b>Job ID:</b> ${safeHtml(candidate.jobid || "")}</div>
              <div><b>Department:</b> ${safeHtml(job.department || "")}</div>
              <div><b>Employment Type:</b> ${safeHtml(job.employmenttype || "")}</div>
              <div><b>Location:</b> ${safeHtml(job.location || "")}</div>
              <div><b>Application No:</b> ${safeHtml(candidate.applicationno || "")}</div>
            </div>
            <h3>Candidate details</h3>
            <div class="meta">
              <div><b>Name:</b> ${safeHtml(candidate.applicantname || "")}</div>
              <div><b>Email:</b> ${safeHtml(candidate.email || "")}</div>
	              <div><b>Phone:</b> ${safeHtml(candidate.phone || "")}</div>
	              <div><b>Total Experience:</b> ${safeHtml(candidateTotalExperience(candidate) || "")}</div>
	              <div><b>Status:</b> ${safeHtml(candidate.status || "")}</div>
              <div><b>Approval:</b> ${safeHtml(candidate.approvalstatus || "")}</div>
              <div><b>Submitted:</b> ${safeHtml(candidate.submittedat ? new Date(candidate.submittedat).toLocaleString() : "")}</div>
            </div>
            ${tableHtml("Form fields", customRows, [{ name: "field", label: "Field" }, { name: "value", label: "Value" }])}
            ${tableHtml("Educational qualification", candidate.educationalqualifications || [], [
              { name: "qualification", label: "Qualification" },
              { name: "specialization", label: "Specialization" },
              { name: "universityboard", label: "University/Board" },
	              { name: "institute", label: "Institute" },
	              { name: "passingyear", label: "Year" },
	              { name: "percentagecgpa", label: "Marks/Grade" },
	              { name: "mediumofinstruction", label: "Medium" },
	              { name: "modeofstudy", label: "Mode" }
	            ])}
	            ${tableHtml("Family details", candidate.familydetails || [], [
	              { name: "name", label: "Name" },
	              { name: "age", label: "Age" },
	              { name: "relationship", label: "Relation" },
	              { name: "location", label: "Location" },
	              { name: "occupation", label: "Occupation" },
	              { name: "contactemail", label: "Email" },
	              { name: "contactphone", label: "Phone" }
	            ])}
            ${tableHtml("Past employment and references", candidate.pastemployments || [], [
              { name: "organization", label: "Organization" },
              { name: "designation", label: "Designation" },
              { name: "employmenttype", label: "Type" },
              { name: "dateofjoining", label: "Joining" },
              { name: "lastworkingdate", label: "Last day" },
              { name: "totalexperience", label: "Experience" },
              { name: "referencename", label: "Reference" },
              { name: "referenceemail", label: "Ref email" },
              { name: "referencephone", label: "Ref phone" }
            ])}
            ${tableHtml("Candidate document panel", candidate.candidatedocuments || [], [
              { name: "type", label: "Type" },
              { name: "documentname", label: "Document" },
              { name: "link", label: "Link", link: true }
            ])}
            ${tableHtml("Uploaded documents", standardDocs, [
              { name: "documenttype", label: "Document" },
              { name: "link", label: "Link", link: true }
            ])}
            <h3>Validation</h3>
            <div>${safeHtml(candidate.validationcomments || candidate.mandatoryvalidationcomments || "-")}</div>
            <div class="footer"><span>Prepared by: ${safeHtml(global1.name || "")}</span><span>Office use / Signature</span></div>
          </div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `;
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) return setError("Popup blocked. Please allow popups to print candidate profile.");
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  };

  const selectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setConfirmationMail({
      subject: `Recruitment confirmation - ${selectedJobInfo.title || selectedJob || "Application"}`,
      body: candidateSampleMail(candidate)
    });
  };

  const runAiShortlist = async () => {
    if (!selectedJob || !aiInstruction.trim()) return setError("Select job and enter shortlisting instruction");
    const res = await ep1.post("/api/v2/recruitment/shortlist-ai", { colid, jobid: selectedJob, instruction: aiInstruction });
    setMessage(`AI shortlisting completed. Selected: ${res.data.selectedCount || 0}`);
    await loadApplications();
  };

  const updateCandidateStatus = async (row, status) => {
    await ep1.post("/api/v2/recruitment/application-status", { colid, id: row._id, status, shortlistcomments: status });
    await loadApplications();
  };

  const updateCandidateApproval = async (row, action) => {
    await ep1.post("/api/v2/recruitment/application-approval", {
      colid,
      id: row._id,
      action,
      comments: approvalComments,
      approvername: global1.name,
      approveremail: global1.user,
      status: action === "Reject" ? "Rejected" : ""
    });
    setMessage(`Candidate ${action === "Reject" ? "rejected" : "approved"}`);
    setApprovalComments("");
    await loadApplications();
  };

  const confirmCandidate = async () => {
    if (!selectedCandidate?._id) return setError("Select a candidate first");
    if (!selectedCandidate.email) return setError("Selected candidate does not have an email address");
    if (!confirmationMail.body.trim()) return setError("Email content is required");
    try {
      setConfirming(true);
      setError("");
      const res = await ep1.post("/api/v2/recruitment/application-status", {
        colid,
        id: selectedCandidate._id,
        status: "Confirmed",
        shortlistcomments: "Confirmed",
        emailsubject: confirmationMail.subject,
        emailbody: confirmationMail.body,
        senderName: global1.name || global1.insname || "Recruitment"
      });
      setMessage(res.data?.mailSent ? "Candidate confirmed and email sent" : "Candidate confirmed");
      await loadApplications();
      setSelectedCandidate({ ...selectedCandidate, status: "Confirmed" });
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to confirm candidate");
    } finally {
      setConfirming(false);
    }
  };

  const jobColumns = [
    { field: "jobid", headerName: "Job ID", width: 130 },
    { field: "title", headerName: "Title", width: 220 },
    { field: "department", headerName: "Department", width: 160 },
    { field: "formid", headerName: "Form", width: 150 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "share",
      headerName: "Share",
      width: 260,
      renderCell: ({ row }) => /^posted$/i.test(row.status || "") ? (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => copyShareLink(row)}>Copy link</Button>
          <Button size="small" onClick={() => window.open(shareLink(row), "_blank", "noopener,noreferrer")}>Open</Button>
        </Stack>
      ) : (
        <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => publishAndCopyShareLink(row)}>Generate link</Button>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => setJobData({ ...blankJob, ...row, id: row._id, lastdate: row.lastdate ? String(row.lastdate).slice(0, 10) : "" })}><EditIcon fontSize="small" /></Button>
          <Button color="error" size="small" onClick={() => deleteBy("/api/v2/recruitment/jobs-delete", { id: row._id }, loadJobs)}><DeleteIcon fontSize="small" /></Button>
        </Stack>
      )
    }
  ];

  const fieldColumns = [
    { field: "page", headerName: "Page", width: 130 },
    { field: "section", headerName: "Section", width: 170 },
    { field: "label", headerName: "Label", width: 190 },
    { field: "fieldname", headerName: "Field", width: 170 },
    { field: "fieldtype", headerName: "Type", width: 120 },
    { field: "isrequired", headerName: "Required", width: 110 },
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => setFieldData({ ...row, options: (row.options || []).join(",") })}><EditIcon fontSize="small" /></Button>
          <Button color="error" size="small" onClick={() => deleteBy("/api/v2/recruitment/fields-delete", { id: row._id }, loadFields)}><DeleteIcon fontSize="small" /></Button>
        </Stack>
      )
    }
  ];

  const applicationColumns = [
    {
      field: "photourl",
      headerName: "Photo",
      width: 90,
      renderCell: ({ row }) => {
        const photo = row.photourl || row.documents?.find((doc) => /photo/i.test(doc.documenttype || ""))?.url || "";
        return photo ? <Box component="img" src={photo} alt="Candidate" sx={{ width: 46, height: 54, objectFit: "cover", borderRadius: 1, border: "1px solid #d1d5db" }} /> : "";
      }
    },
    { field: "applicationno", headerName: "Application", width: 210 },
    { field: "applicantname", headerName: "Candidate", width: 180 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "totalexperience", headerName: "Total Experience", width: 160, valueGetter: ({ row }) => candidateTotalExperience(row) },
    { field: "status", headerName: "Status", width: 130 },
    { field: "approvalstatus", headerName: "Approval", width: 130 },
    { field: "approvallevel", headerName: "Level", width: 90 },
    { field: "validationstatus", headerName: "Validation", width: 130 },
    {
      field: "profile",
      headerName: "Profile",
      width: 120,
      renderCell: ({ row }) => <Button size="small" startIcon={<PrintIcon />} onClick={() => printCandidateProfile(row)}>Profile</Button>
    },
    {
      field: "changestatus",
      headerName: "Change Status",
      width: 190,
      renderCell: ({ row }) => (
        <TextField
          select
          size="small"
          value={row.status || ""}
          onChange={(e) => updateCandidateStatus(row, e.target.value)}
          sx={{ minWidth: 165 }}
        >
          {[...new Set([...(candidateStatuses || []).filter((item) => item.isactive !== "No").map((item) => item.status), row.status].filter(Boolean))].map((status) => (
            <MenuItem key={status} value={status}>{status}</MenuItem>
          ))}
        </TextField>
      )
    },
    {
      field: "approvalaction",
      headerName: "Approval Action",
      width: 230,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" color="success" onClick={() => updateCandidateApproval(row, "Approve")} disabled={row.approvalstatus === "Approved" || row.approvalstatus === "Rejected"}>Approve</Button>
          <Button size="small" color="error" onClick={() => updateCandidateApproval(row, "Reject")} disabled={row.approvalstatus === "Approved" || row.approvalstatus === "Rejected"}>Reject</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Recruitment Management">
      <Box sx={{ p: 3, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Recruitment Management</Typography>
            <Typography variant="body2" color="text.secondary">Job posts, dynamic forms, documents, validation and candidate shortlisting.</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`Forms ${forms.length}`} color="primary" variant="outlined" />
            <Chip label={`Jobs ${jobs.length}`} color="secondary" variant="outlined" />
            <Chip label={`Candidates ${applications.length}`} color="success" variant="outlined" />
          </Stack>
        </Stack>
        {message && <Alert severity="success" sx={{ mt: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mt: 2 }}>
          <Tab label="Job posts" />
          <Tab label="Forms" />
          <Tab label="Fields" />
          <Tab label="Documents" />
          <Tab label="Validation" />
          <Tab label="Candidate Status" />
          <Tab label="Approval Levels" />
          <Tab label="Candidates" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" fontWeight={800}>Create job post</Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {["jobid", "title", "department", "location", "openings", "salaryrange"].map((name) => (
              <Grid item xs={12} md={name === "title" ? 4 : 2} key={name}>
                <TextField fullWidth size="small" label={name} value={jobData[name] || ""} onChange={(e) => setJobData({ ...jobData, [name]: e.target.value })} />
              </Grid>
            ))}
            <Grid item xs={12} md={3}>
              <TextField select fullWidth size="small" label="Employment type" value={jobData.employmenttype || ""} onChange={(e) => setJobData({ ...jobData, employmenttype: e.target.value })}>
                {employmentTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth size="small" label="Assign form" value={jobData.formid} onChange={(e) => setJobData({ ...jobData, formid: e.target.value })}>
                {forms.map((form) => <MenuItem key={form.formid} value={form.formid}>{form.title} ({form.formid})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth size="small" label="Status" value={jobData.status} onChange={(e) => setJobData({ ...jobData, status: e.target.value })}>
                {["Draft", "Posted", "Closed"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth size="small" type="date" label="Last date" InputLabelProps={{ shrink: true }} value={jobData.lastdate || ""} onChange={(e) => setJobData({ ...jobData, lastdate: e.target.value })} />
            </Grid>
            {["description", "eligibility", "skills"].map((name) => (
              <Grid item xs={12} md={4} key={name}>
                <TextField fullWidth multiline minRows={3} label={name} value={jobData[name] || ""} onChange={(e) => setJobData({ ...jobData, [name]: e.target.value })} />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={saveJob}>Save job</Button>
            </Grid>
          </Grid>
          <Box sx={{ height: 430, mt: 2 }}>
            <DataGrid rows={jobs} columns={jobColumns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} />
          </Box>
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" fontWeight={800}>Recruitment forms</Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Form ID" value={formData.formid} onChange={(e) => setFormData({ ...formData, formid: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Form name" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Active" value={formData.isactive} onChange={(e) => setFormData({ ...formData, isactive: e.target.value })}>{yesNo.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth size="small" label="Educational qualification panel" value={formData.includeeducationpanel || "No"} onChange={(e) => setFormData({ ...formData, includeeducationpanel: e.target.value })}>{yesNo.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth size="small" label="Family details panel" value={formData.includefamilypanel || "No"} onChange={(e) => setFormData({ ...formData, includefamilypanel: e.target.value })}>{yesNo.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth size="small" label="Past employment panel" value={formData.includeemploymentpanel || "No"} onChange={(e) => setFormData({ ...formData, includeemploymentpanel: e.target.value })}>{yesNo.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth size="small" label="Candidate documents panel" value={formData.includedocumentpanel || "No"} onChange={(e) => setFormData({ ...formData, includedocumentpanel: e.target.value })}>{yesNo.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}><Button variant="contained" onClick={saveForm}>Save form</Button></Grid>
          </Grid>
          <Box sx={{ height: 360, mt: 2 }}>
            <DataGrid rows={forms} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} columns={[
              { field: "formid", headerName: "Form ID", width: 160 },
              { field: "title", headerName: "Title", width: 240 },
	              { field: "description", headerName: "Description", width: 360 },
	              { field: "isactive", headerName: "Active", width: 120 },
	              { field: "includeeducationpanel", headerName: "Education", width: 120 },
	              { field: "includefamilypanel", headerName: "Family", width: 110 },
	              { field: "includeemploymentpanel", headerName: "Employment", width: 130 },
	              { field: "includedocumentpanel", headerName: "Documents", width: 130 },
	              { field: "actions", headerName: "Actions", width: 220, renderCell: ({ row }) => (
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => { setSelectedForm(row.formid); setFormData(row); }}>Select/Edit</Button>
                  <Button color="error" size="small" onClick={() => deleteBy("/api/v2/recruitment/forms-delete", { id: row._id, formid: row.formid }, loadForms)}>Delete</Button>
                </Stack>
              ) }
            ]} />
          </Box>
        </Paper>
      )}

      {[2, 3, 4].includes(tab) && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <FormControl size="small" sx={{ minWidth: 300, mb: 2 }}>
            <InputLabel>Selected form</InputLabel>
            <Select label="Selected form" value={selectedForm} onChange={(e) => setSelectedForm(e.target.value)}>
              {forms.map((form) => <MenuItem key={form.formid} value={form.formid}>{form.title} ({form.formid})</MenuItem>)}
            </Select>
          </FormControl>

          {tab === 2 && (
            <>
              <Typography variant="h6" fontWeight={800}>Custom fields</Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                {["page", "section", "label", "fieldname"].map((name) => (
                  <Grid item xs={12} md={3} key={name}><TextField fullWidth size="small" label={name} value={fieldData[name] || ""} onChange={(e) => setFieldData({ ...fieldData, [name]: e.target.value })} /></Grid>
                ))}
                <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Type" value={fieldData.fieldtype} onChange={(e) => setFieldData({ ...fieldData, fieldtype: e.target.value })}>{fieldTypes.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={5}><TextField fullWidth size="small" label="Options comma separated" value={fieldData.options || ""} onChange={(e) => setFieldData({ ...fieldData, options: e.target.value })} /></Grid>
                <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Required" value={fieldData.isrequired} onChange={(e) => setFieldData({ ...fieldData, isrequired: e.target.value })}>{yesNo.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={1}><TextField fullWidth size="small" type="number" label="Order" value={fieldData.order || 0} onChange={(e) => setFieldData({ ...fieldData, order: e.target.value })} /></Grid>
                <Grid item xs={12}><Button variant="contained" onClick={saveField}>Save field</Button></Grid>
              </Grid>
              <Box sx={{ height: 420, mt: 2 }}><DataGrid rows={fields} columns={fieldColumns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} /></Box>
            </>
          )}

          {tab === 3 && (
            <>
              <Typography variant="h6" fontWeight={800}>Document list for form</Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Document type" value={docData.documenttype} onChange={(e) => setDocData({ ...docData, documenttype: e.target.value })} /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Description" value={docData.description} onChange={(e) => setDocData({ ...docData, description: e.target.value })} /></Grid>
                <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Required" value={docData.isrequired} onChange={(e) => setDocData({ ...docData, isrequired: e.target.value })}>{yesNo.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={1}><Button variant="contained" onClick={saveDocument}>Save</Button></Grid>
              </Grid>
              <Box sx={{ height: 360, mt: 2 }}>
                <DataGrid rows={documents} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} columns={[
                  { field: "documenttype", headerName: "Document", width: 220 },
                  { field: "description", headerName: "Description", width: 420 },
                  { field: "isrequired", headerName: "Required", width: 130 },
                  { field: "actions", headerName: "Actions", width: 160, renderCell: ({ row }) => <Button color="error" size="small" onClick={() => deleteBy("/api/v2/recruitment/documents-delete", { id: row._id }, loadDocuments)}>Delete</Button> }
                ]} />
              </Box>
            </>
          )}

          {tab === 4 && (
            <>
              <Typography variant="h6" fontWeight={800}>Mandatory and optional validation criteria</Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={8} label="Mandatory criteria" value={criteria.mandatorycriteria} onChange={(e) => setCriteria({ ...criteria, mandatorycriteria: e.target.value })} /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={8} label="Optional validation criteria" value={criteria.validationcriteria} onChange={(e) => setCriteria({ ...criteria, validationcriteria: e.target.value })} /></Grid>
                <Grid item xs={12}><Button variant="contained" onClick={saveCriteria}>Save criteria</Button></Grid>
              </Grid>
            </>
          )}
        </Paper>
      )}

      {tab === 5 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" fontWeight={800}>Candidate status master</Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Status" value={statusData.status} onChange={(e) => setStatusData({ ...statusData, status: e.target.value })} /></Grid>
            <Grid item xs={12} md={5}><TextField fullWidth size="small" label="Description" value={statusData.description} onChange={(e) => setStatusData({ ...statusData, description: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Active" value={statusData.isactive} onChange={(e) => setStatusData({ ...statusData, isactive: e.target.value })}>{yesNo.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={saveCandidateStatus}>Save</Button></Grid>
          </Grid>
          <Box sx={{ height: 360, mt: 2 }}>
            <DataGrid rows={candidateStatuses} getRowId={(row) => row._id || row.status} slots={{ toolbar: GridToolbar }} columns={[
              { field: "status", headerName: "Status", width: 220 },
              { field: "description", headerName: "Description", width: 420 },
              { field: "isactive", headerName: "Active", width: 120 },
              { field: "actions", headerName: "Actions", width: 220, renderCell: ({ row }) => row.isdefault ? "" : (
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => setStatusData({ ...blankCandidateStatus, ...row, id: row._id })}>Edit</Button>
                  <Button color="error" size="small" onClick={() => deleteBy("/api/v2/recruitment/candidate-statuses-delete", { id: row._id }, loadCandidateStatuses)}>Delete</Button>
                </Stack>
              ) }
            ]} />
          </Box>
        </Paper>
      )}

      {tab === 6 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" fontWeight={800}>Dynamic approval levels for job role</Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth size="small" label="Job role" value={approvalData.jobid || selectedJob} onChange={(e) => setApprovalData({ ...approvalData, jobid: e.target.value })}>
                {jobs.map((job) => <MenuItem key={job.jobid} value={job.jobid}>{job.jobid} - {job.title}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={1}><TextField fullWidth size="small" type="number" label="Level" value={approvalData.level} onChange={(e) => setApprovalData({ ...approvalData, level: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Approver role" value={approvalData.approverrole} onChange={(e) => setApprovalData({ ...approvalData, approverrole: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Approver name" value={approvalData.approvername} onChange={(e) => setApprovalData({ ...approvalData, approvername: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Approver email" value={approvalData.approveremail} onChange={(e) => setApprovalData({ ...approvalData, approveremail: e.target.value })} /></Grid>
            <Grid item xs={12} md={1}><TextField select fullWidth size="small" label="Active" value={approvalData.isactive} onChange={(e) => setApprovalData({ ...approvalData, isactive: e.target.value })}>{yesNo.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={1}><Button fullWidth variant="contained" onClick={saveApprovalLevel}>Save</Button></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Description" value={approvalData.description} onChange={(e) => setApprovalData({ ...approvalData, description: e.target.value })} /></Grid>
          </Grid>
          <Box sx={{ height: 400, mt: 2 }}>
            <DataGrid rows={approvalLevels} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} columns={[
              { field: "jobid", headerName: "Job", width: 140 },
              { field: "jobtitle", headerName: "Job title", width: 220 },
              { field: "level", headerName: "Level", width: 90 },
              { field: "approverrole", headerName: "Role", width: 150 },
              { field: "approvername", headerName: "Approver", width: 180 },
              { field: "approveremail", headerName: "Email", width: 220 },
              { field: "isactive", headerName: "Active", width: 100 },
              { field: "actions", headerName: "Actions", width: 220, renderCell: ({ row }) => (
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => setApprovalData({ ...blankApprovalLevel, ...row, id: row._id })}>Edit</Button>
                  <Button color="error" size="small" onClick={() => deleteBy("/api/v2/recruitment/approval-levels-delete", { id: row._id }, () => loadApprovalLevels(selectedJob))}>Delete</Button>
                </Stack>
              ) }
            ]} />
          </Box>
        </Paper>
      )}

      {tab === 7 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <TextField select size="small" label="Job" value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} sx={{ minWidth: 280 }}>
              {jobs.map((job) => <MenuItem key={job.jobid} value={job.jobid}>{job.jobid} - {job.title}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Filter field" value={filterField} onChange={(e) => setFilterField(e.target.value)} sx={{ minWidth: 200 }}>
              <MenuItem value="">No field filter</MenuItem>
              {candidateFields.map((field) => <MenuItem key={field} value={field}>{field}</MenuItem>)}
            </TextField>
            <TextField size="small" label="Filter value" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
            <TextField size="small" label="Search any text/custom field" value={textSearch} onChange={(e) => setTextSearch(e.target.value)} sx={{ minWidth: 260 }} />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <TextField
            fullWidth
            size="small"
            label="Approval comments"
            value={approvalComments}
            onChange={(e) => setApprovalComments(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField fullWidth multiline minRows={2} label="AI shortlisting instruction in English" value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)} />
            <Button variant="contained" startIcon={<AutoFixHighIcon />} onClick={runAiShortlist} sx={{ minWidth: 180 }}>AI Shortlist</Button>
          </Stack>
          <Box sx={{ height: 470, mt: 2 }}>
            <DataGrid
              rows={filteredApplications}
              columns={applicationColumns}
              getRowId={(row) => row._id}
              slots={{ toolbar: GridToolbar }}
              onRowClick={(params) => selectCandidate(params.row)}
              rowSelectionModel={selectedCandidate?._id ? [selectedCandidate._id] : []}
            />
          </Box>
          <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2, bgcolor: "#fbfdff" }}>
            {selectedCandidate && (
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }} alignItems={{ md: "center" }}>
                {(() => {
                  const photo = selectedCandidate.photourl || selectedCandidate.documents?.find((doc) => /photo/i.test(doc.documenttype || ""))?.url || "";
                  return photo ? <Box component="img" src={photo} alt="Candidate" sx={{ width: 96, height: 116, objectFit: "cover", borderRadius: 1, border: "1px solid #d1d5db" }} /> : null;
                })()}
                <Box>
                  <Typography variant="h6" fontWeight={900}>{selectedCandidate.applicantname}</Typography>
                  <Typography variant="body2">{selectedCandidate.email} | {selectedCandidate.phone}</Typography>
                  <Typography variant="body2">Status: {selectedCandidate.status} | Approval: {selectedCandidate.approvalstatus || "Pending"} | Level: {selectedCandidate.approvallevel || 0}</Typography>
                </Box>
              </Stack>
            )}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Confirm candidate and send mail</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCandidate
                    ? `Selected: ${selectedCandidate.applicantname || "Candidate"} (${selectedCandidate.email || "no email"})`
                    : "Select a candidate from the grid to load the sample confirmation email."}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                disabled={confirming || !selectedCandidate}
                onClick={confirmCandidate}
              >
                Confirm and Send Email
              </Button>
            </Stack>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email subject"
                  value={confirmationMail.subject}
                  onChange={(e) => setConfirmationMail({ ...confirmationMail, subject: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={8}
                  label="Sample confirmation mail content"
                  value={confirmationMail.body}
                  onChange={(e) => setConfirmationMail({ ...confirmationMail, body: e.target.value })}
                />
              </Grid>
            </Grid>
          </Paper>
        </Paper>
      )}
      </Box>
    </MenuPageShell>
  );
}
