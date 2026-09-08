import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ep1 from "../api/ep1";

const fieldDefault = (field) => field.fieldtype === "Checkbox" ? [] : "";
const blankEducation = { qualification: "", specialization: "", universityboard: "", institute: "", passingyear: "", percentagecgpa: "", mediumofinstruction: "", modeofstudy: "Regular" };
const blankFamily = { name: "", age: "", relationship: "", location: "", occupation: "", contactemail: "", contactphone: "" };
const blankEmployment = { organization: "", designation: "", employmenttype: "", dateofjoining: "", lastworkingdate: "", totalexperience: "", lastdrawnsalary: "", reasonforleaving: "", referencename: "", referenceemail: "", referencephone: "" };
const blankCandidateDocument = { type: "Academic", documentname: "", link: "" };

const enabled = (value) => /^yes$/i.test(String(value || ""));
const displayValue = (value) => Array.isArray(value) ? value.join(", ") : String(value || "");
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
const withExperience = (rows = []) => rows.map((row) => {
  const months = experienceMonthsBetween(row.dateofjoining, row.lastworkingdate);
  return { ...row, totalexperience: months ? formatExperienceMonths(months) : (row.totalexperience || "") };
});

export default function PublicRecruitmentApplyPage() {
  const query = new URLSearchParams(window.location.search);
  const colid = Number(query.get("colid") || 0);
  const jobid = query.get("jobid") || "";
  const token = query.get("token") || "";
  const [bundle, setBundle] = useState(null);
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    applicantname: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    photourl: "",
    customfields: {},
    documents: [],
    educationalqualifications: [],
    familydetails: [],
    pastemployments: [],
    totalexperience: "",
    candidatedocuments: []
  });
  const [retrieve, setRetrieve] = useState({ applicationno: "", email: "", phone: "" });
  const [showRetrieve, setShowRetrieve] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [validation, setValidation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fields = useMemo(() => bundle?.fields || [], [bundle]);
  const docs = useMemo(() => bundle?.documents || [], [bundle]);
  const photoDocument = useMemo(() => form.documents?.find((doc) => /photo/i.test(doc.documenttype || doc.originalname || "")), [form.documents]);
  const photoUrl = form.photourl || photoDocument?.url || "";
  const calculatedPastEmployments = useMemo(() => withExperience(form.pastemployments || []), [form.pastemployments]);
  const totalExperience = useMemo(() => formatExperienceMonths((form.pastemployments || []).reduce((sum, row) => sum + experienceMonthsBetween(row.dateofjoining, row.lastworkingdate), 0)), [form.pastemployments]);

  const pages = useMemo(() => {
    const ordered = [];
    fields.forEach((field) => {
      const page = field.page || "Page 1";
      if (!ordered.includes(page)) ordered.push(page);
    });
    const panelPages = [
      enabled(bundle?.form?.includeeducationpanel) ? "Educational qualification" : "",
      enabled(bundle?.form?.includefamilypanel) ? "Family details" : "",
      enabled(bundle?.form?.includeemploymentpanel) ? "Past employment" : "",
      enabled(bundle?.form?.includedocumentpanel) ? "Other documents" : ""
    ].filter(Boolean);
    return ["Basic details", ...ordered, ...panelPages, "Documents", "Preview"];
  }, [fields, bundle]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ep1.get("/api/v2/recruitment/public-job", { params: { colid, jobid, token } });
        setBundle(res.data);
        const customfields = {};
        (res.data.fields || []).forEach((field) => { customfields[field.fieldname] = fieldDefault(field); });
        setForm((old) => ({ ...old, customfields }));
      } catch (err) {
        setError(err.response?.data?.msg || err.message);
      }
    };
    if (colid && jobid) load();
  }, [colid, jobid, token]);

  const updateCustom = (field, value) => setForm((old) => ({ ...old, customfields: { ...old.customfields, [field]: value } }));

  const uploadDocument = async (docType, file, description = "") => {
    if (!file) return;
    setLoading(true);
    try {
      const data = new FormData();
      data.append("document", file);
      data.append("colid", colid);
      data.append("jobid", jobid);
      data.append("documenttype", docType);
      data.append("description", description);
      const res = await ep1.post("/api/v2/recruitment/upload-document", data, { headers: { "Content-Type": "multipart/form-data" } });
      setForm((old) => ({
        ...old,
        ...(docType === "Candidate Photo" ? { photourl: res.data.url } : {}),
        documents: [...(old.documents || []).filter((d) => d.documenttype !== docType), res.data]
      }));
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateArrayField = (collection, index, field, value) => {
    setForm((old) => {
      const rows = [...(old[collection] || [])];
      rows[index] = { ...(rows[index] || {}), [field]: value };
      if (collection === "pastemployments" && ["dateofjoining", "lastworkingdate"].includes(field)) {
        const months = experienceMonthsBetween(rows[index].dateofjoining, rows[index].lastworkingdate);
        rows[index].totalexperience = months ? formatExperienceMonths(months) : "";
      }
      const next = { ...old, [collection]: rows };
      if (collection === "pastemployments") {
        next.totalexperience = formatExperienceMonths(rows.reduce((sum, row) => sum + experienceMonthsBetween(row.dateofjoining, row.lastworkingdate), 0));
      }
      return next;
    });
  };

  const addArrayRow = (collection, blank) => setForm((old) => ({ ...old, [collection]: [...(old[collection] || []), { ...blank }] }));
  const removeArrayRow = (collection, index) => setForm((old) => {
    const rows = (old[collection] || []).filter((_, i) => i !== index);
    return {
      ...old,
      [collection]: rows,
      ...(collection === "pastemployments" ? { totalexperience: formatExperienceMonths(rows.reduce((sum, row) => sum + experienceMonthsBetween(row.dateofjoining, row.lastworkingdate), 0)) } : {})
    };
  });

  const uploadCandidatePanelDocument = async (index, file) => {
    if (!file) return;
    setLoading(true);
    try {
      const row = form.candidatedocuments?.[index] || {};
      const docType = row.documentname || `Candidate ${row.type || "Document"}`;
      const data = new FormData();
      data.append("document", file);
      data.append("colid", colid);
      data.append("jobid", jobid);
      data.append("documenttype", docType);
      data.append("description", row.type || "Candidate document");
      const res = await ep1.post("/api/v2/recruitment/upload-document", data, { headers: { "Content-Type": "multipart/form-data" } });
      updateArrayField("candidatedocuments", index, "link", res.data.url);
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateAndSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        pastemployments: calculatedPastEmployments,
        totalexperience: totalExperience,
        username: form.email,
        photourl: photoUrl,
        colid,
        jobid,
        formid: bundle.job.formid,
        status: "Submitted"
      };
      const validationRes = await ep1.post("/api/v2/recruitment/validate-application", payload);
      setValidation(validationRes.data);
      if (validationRes.data?.mandatoryFailed) {
        setTab(0);
        return;
      }
      const submitRes = await ep1.post("/api/v2/recruitment/submit-application", {
        ...payload,
        validationstatus: validationRes.data.validationstatus,
        validationcomments: validationRes.data.validationcomments,
        mandatoryvalidationstatus: validationRes.data.mandatoryFailed ? "Fail" : "Pass",
        mandatoryvalidationcomments: validationRes.data.validationcomments,
        mode: submitted ? "update" : ""
      });
      setSubmitted(submitRes.data);
      setTab(pages.length - 1);
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  const retrieveApplication = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/recruitment/retrieve-application", { ...retrieve, colid });
      setSubmitted(res.data);
      setForm({
        applicantname: res.data.applicantname || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        username: res.data.username || res.data.email || "",
        password: res.data.password || "",
        photourl: res.data.photourl || "",
        customfields: res.data.customfields || {},
        documents: res.data.documents || [],
        educationalqualifications: res.data.educationalqualifications || [],
        familydetails: res.data.familydetails || [],
        pastemployments: withExperience(res.data.pastemployments || []),
        totalexperience: res.data.totalexperience || formatExperienceMonths((res.data.pastemployments || []).reduce((sum, row) => sum + experienceMonthsBetween(row.dateofjoining, row.lastworkingdate), 0)),
        candidatedocuments: res.data.candidatedocuments || []
      });
      setTab(pages.length - 1);
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderEditableRows = (title, collection, blank, fieldsList) => (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={900}>{title}</Typography>
        <Button variant="outlined" onClick={() => addArrayRow(collection, blank)}>Add row</Button>
      </Stack>
      {!(form[collection] || []).length && <Alert severity="info">No rows added. Click Add row to enter details.</Alert>}
      {(form[collection] || []).map((row, index) => (
        <Paper key={`${collection}-${index}`} variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {fieldsList.map((field) => (
              <Grid item xs={12} md={field.full ? 12 : 4} key={field.name}>
                <TextField
                  select={!!field.options}
                  fullWidth
                  size="small"
                  type={field.type || "text"}
                  label={field.label}
                  InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
                  value={row[field.name] || ""}
                  onChange={(e) => updateArrayField(collection, index, field.name, e.target.value)}
                  InputProps={field.readOnly ? { readOnly: true } : undefined}
                  multiline={field.multiline}
                  minRows={field.multiline ? 2 : undefined}
                >
                  {(field.options || []).map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            {collection === "candidatedocuments" && (
              <Grid item xs={12} md={4}>
                <Button fullWidth variant="outlined" component="label" startIcon={<UploadFileIcon />} disabled={loading}>
                  Upload through AWS
                  <input hidden type="file" onChange={(e) => uploadCandidatePanelDocument(index, e.target.files?.[0])} />
                </Button>
                {row.link && <Typography variant="caption" component="a" href={row.link} target="_blank" rel="noreferrer" sx={{ display: "block", wordBreak: "break-all", mt: 1 }}>{row.link}</Typography>}
              </Grid>
            )}
            <Grid item xs={12}>
              <Button color="error" size="small" onClick={() => removeArrayRow(collection, index)}>Remove row</Button>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Stack>
  );

  const renderReadonlyRows = (title, rows, columns) => rows?.length ? (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" fontWeight={800}>{title}</Typography>
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", mt: 0.5, "& th, & td": { border: "1px solid #d1d5db", p: 0.75, fontSize: 12, verticalAlign: "top" }, "& th": { bgcolor: "#eef2ff" } }}>
        <tbody>
          <tr>{columns.map((col) => <th key={col.name}>{col.label}</th>)}</tr>
          {rows.map((row, index) => <tr key={`${title}-${index}`}>{columns.map((col) => <td key={col.name}>{col.link && row[col.name] ? <a href={row[col.name]} target="_blank" rel="noreferrer">{row[col.name]}</a> : displayValue(row[col.name])}</td>)}</tr>)}
        </tbody>
      </Box>
    </Box>
  ) : null;

  const renderField = (field) => {
    const value = form.customfields?.[field.fieldname] ?? "";
    const label = `${field.label}${field.isrequired === "Yes" ? " *" : ""}`;
    if (["Select", "Radio"].includes(field.fieldtype)) {
      return (
        <TextField select fullWidth label={label} value={value} onChange={(e) => updateCustom(field.fieldname, e.target.value)}>
          {(field.options || []).map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </TextField>
      );
    }
    if (field.fieldtype === "Textarea") return <TextField fullWidth multiline minRows={3} label={label} value={value} onChange={(e) => updateCustom(field.fieldname, e.target.value)} />;
    if (["File", "Photo"].includes(field.fieldtype)) {
      const uploaded = form.documents.find((doc) => doc.documenttype === field.label || doc.documenttype === field.fieldname);
      return (
        <Stack spacing={1}>
          <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} disabled={loading}>
            Upload {label}
            <input hidden type="file" accept={field.fieldtype === "Photo" ? ".jpg,.jpeg,.png" : undefined} onChange={(e) => uploadDocument(field.label || field.fieldname, e.target.files?.[0])} />
          </Button>
          {uploaded?.url && <Typography variant="caption" component="a" href={uploaded.url} target="_blank" rel="noreferrer">{uploaded.url}</Typography>}
        </Stack>
      );
    }
    const type = field.fieldtype === "Number" ? "number" : field.fieldtype === "Date" ? "date" : field.fieldtype === "Email" ? "email" : "text";
    return <TextField fullWidth type={type} InputLabelProps={type === "date" ? { shrink: true } : undefined} label={label} value={value} onChange={(e) => updateCustom(field.fieldname, e.target.value)} />;
  };

  if (!colid || !jobid) return <Box sx={{ p: 3 }}><Alert severity="error">Recruitment link is invalid.</Alert></Box>;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb", p: { xs: 1.5, md: 3 } }}>
      <Paper sx={{ maxWidth: 1120, mx: "auto", p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {validation?.mandatoryFailed && (
          <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-line" }}>
            Mandatory validation failed. Please correct the following before submission.
            {"\n"}{validation.validationcomments}
          </Alert>
        )}
        {validation && !validation.mandatoryFailed && (
          <Alert severity="success" sx={{ mb: 2, whiteSpace: "pre-line" }}>{validation.validationcomments}</Alert>
        )}

        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={900}>{bundle?.job?.title || "Recruitment Application"}</Typography>
            <Typography color="text.secondary">{bundle?.job?.department} {bundle?.job?.location ? `| ${bundle.job.location}` : ""}</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={bundle?.job?.employmenttype || "Job"} color="primary" />
            <Chip label={`Openings: ${bundle?.job?.openings || 1}`} variant="outlined" />
          </Stack>
        </Stack>

        <Button sx={{ mt: 1 }} size="small" onClick={() => setShowRetrieve((v) => !v)}>Already applied? Retrieve application</Button>
        {showRetrieve && (
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>Retrieve application</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Application number" value={retrieve.applicationno} onChange={(e) => setRetrieve({ ...retrieve, applicationno: e.target.value })} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Email" value={retrieve.email} onChange={(e) => setRetrieve({ ...retrieve, email: e.target.value })} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Phone" value={retrieve.phone} onChange={(e) => setRetrieve({ ...retrieve, phone: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={retrieveApplication} disabled={loading}>Retrieve</Button></Grid>
            </Grid>
          </Paper>
        )}

        <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" sx={{ mt: 2 }}>
          {pages.map((page) => <Tab key={page} label={page} />)}
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {pages[tab] === "Basic details" && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><TextField fullWidth label="Applicant name *" value={form.applicantname} onChange={(e) => setForm({ ...form, applicantname: e.target.value })} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value, username: e.target.value })} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                  <Typography fontWeight={800}>Candidate Photo *</Typography>
                  <Typography variant="body2" color="text.secondary">Upload JPG, JPEG or PNG.</Typography>
                  <Button sx={{ mt: 1 }} variant="outlined" component="label" startIcon={<UploadFileIcon />} disabled={loading}>
                    Upload Photo
                    <input hidden type="file" accept=".jpg,.jpeg,.png" onChange={(e) => uploadDocument("Candidate Photo", e.target.files?.[0], "Candidate Photo")} />
                  </Button>
                  {photoUrl && (
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
                      <Box component="img" src={photoUrl} alt="Candidate" sx={{ width: 70, height: 82, objectFit: "cover", border: "1px solid #d1d5db" }} />
                      <Typography sx={{ wordBreak: "break-all" }} variant="caption" component="a" href={photoUrl} target="_blank" rel="noreferrer">{photoUrl}</Typography>
                    </Stack>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12}><Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>{bundle?.job?.description}</Typography></Grid>
            </Grid>
          )}

          {fields.some((field) => field.page === pages[tab]) && (
            <Grid container spacing={2}>
              {fields.filter((field) => field.page === pages[tab]).map((field) => (
                <Grid item xs={12} md={field.fieldtype === "Textarea" ? 12 : 6} key={field._id}>
                  {renderField(field)}
                </Grid>
              ))}
            </Grid>
          )}

          {pages[tab] === "Documents" && (
            <Grid container spacing={2}>
              {docs.map((doc) => {
                const uploaded = form.documents.find((item) => item.documenttype === doc.documenttype);
                return (
                  <Grid item xs={12} md={6} key={doc._id}>
                    <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                      <Typography fontWeight={800}>{doc.documenttype}{doc.isrequired === "Yes" ? " *" : ""}</Typography>
                      <Typography variant="body2" color="text.secondary">{doc.description}</Typography>
                      <Button sx={{ mt: 1 }} variant="outlined" component="label" startIcon={<UploadFileIcon />} disabled={loading}>
                        Upload
                        <input hidden type="file" onChange={(e) => uploadDocument(doc.documenttype, e.target.files?.[0], doc.description)} />
                      </Button>
                      {uploaded?.url && <Typography sx={{ mt: 1, wordBreak: "break-all" }} variant="caption" component="a" href={uploaded.url} target="_blank" rel="noreferrer">{uploaded.url}</Typography>}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {pages[tab] === "Educational qualification" && renderEditableRows("Educational qualification", "educationalqualifications", blankEducation, [
            { name: "qualification", label: "Qualification/Degree" },
            { name: "specialization", label: "Specialization" },
            { name: "universityboard", label: "University/Board" },
            { name: "institute", label: "Institute/College Name" },
            { name: "passingyear", label: "Passing Year", type: "number" },
            { name: "percentagecgpa", label: "Percentage/CGPA/Grade" },
            { name: "mediumofinstruction", label: "Medium of instruction" },
            { name: "modeofstudy", label: "Mode of Study", options: ["Regular", "Distance", "Part-Time"] }
          ])}

          {pages[tab] === "Family details" && renderEditableRows("Family details", "familydetails", blankFamily, [
            { name: "name", label: "Name" },
            { name: "age", label: "Age", type: "number" },
            { name: "relationship", label: "Relationship" },
            { name: "location", label: "Location" },
            { name: "occupation", label: "Occupation" },
            { name: "contactemail", label: "Contact email", type: "email" },
            { name: "contactphone", label: "Contact phone" }
          ])}

          {pages[tab] === "Past employment" && renderEditableRows("Past employment", "pastemployments", blankEmployment, [
            { name: "organization", label: "Organization" },
            { name: "designation", label: "Designation" },
            { name: "employmenttype", label: "Employment type" },
            { name: "dateofjoining", label: "Date of Joining", type: "date" },
            { name: "lastworkingdate", label: "Last Working Date", type: "date" },
            { name: "totalexperience", label: "Total Experience", readOnly: true },
            { name: "lastdrawnsalary", label: "Last Drawn Salary" },
            { name: "reasonforleaving", label: "Reason for Leaving", full: true, multiline: true },
            { name: "referencename", label: "Reference name" },
            { name: "referenceemail", label: "Reference email", type: "email" },
            { name: "referencephone", label: "Reference phone" }
          ])}
          {pages[tab] === "Past employment" && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Total experience across all jobs: <b>{totalExperience || "0 months"}</b>
            </Alert>
          )}

          {pages[tab] === "Other documents" && renderEditableRows("Other documents", "candidatedocuments", blankCandidateDocument, [
            { name: "type", label: "Type", options: ["Academic", "Employment", "Others"] },
            { name: "documentname", label: "Document name" },
            { name: "link", label: "Link" }
          ])}

          {pages[tab] === "Preview" && (
            <Box id="recruitment-print">
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h5" fontWeight={900}>Application Summary</Typography>
                  <Typography>{bundle?.job?.title}</Typography>
                  <Typography variant="body2">Application ID: {submitted?.applicationno || "Will be generated after submission"}</Typography>
                </Box>
                <Box sx={{ width: 120, height: 140, border: "1px solid #9ca3af", display: "grid", placeItems: "center", color: "text.secondary", overflow: "hidden" }}>
                  {photoUrl ? <Box component="img" src={photoUrl} alt="Applicant" sx={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "Photo"}
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
	              <Grid container spacing={1}>
                {[
	                  ["Name", form.applicantname],
	                  ["Email", form.email],
	                  ["Phone", form.phone],
	                  ["Total experience", totalExperience || form.totalexperience || ""],
	                  ["Status", submitted?.status || "Draft"]
                ].map(([label, value]) => (
                  <Grid item xs={12} md={6} key={label}><Typography><b>{label}:</b> {value}</Typography></Grid>
                ))}
	                {Object.entries(form.customfields || {}).map(([key, value]) => (
	                  <Grid item xs={12} md={6} key={key}><Typography><b>{key}:</b> {displayValue(value)}</Typography></Grid>
	                ))}
	              </Grid>
	              {renderReadonlyRows("Educational qualification", form.educationalqualifications, [
	                { name: "qualification", label: "Qualification" },
	                { name: "specialization", label: "Specialization" },
	                { name: "universityboard", label: "University/Board" },
	                { name: "institute", label: "Institute" },
		                { name: "passingyear", label: "Year" },
		                { name: "percentagecgpa", label: "Marks/Grade" },
		                { name: "mediumofinstruction", label: "Medium" },
		                { name: "modeofstudy", label: "Mode" }
		              ])}
		              {renderReadonlyRows("Family details", form.familydetails, [
		                { name: "name", label: "Name" },
		                { name: "age", label: "Age" },
		                { name: "relationship", label: "Relation" },
		                { name: "location", label: "Location" },
		                { name: "occupation", label: "Occupation" },
		                { name: "contactemail", label: "Email" },
		                { name: "contactphone", label: "Phone" }
		              ])}
		              {renderReadonlyRows("Past employment", calculatedPastEmployments, [
	                { name: "organization", label: "Organization" },
	                { name: "designation", label: "Designation" },
	                { name: "employmenttype", label: "Type" },
	                { name: "dateofjoining", label: "Joining" },
	                { name: "lastworkingdate", label: "Last day" },
	                { name: "totalexperience", label: "Experience" },
	                { name: "referencename", label: "Reference" },
	                { name: "referenceemail", label: "Reference email" },
	                { name: "referencephone", label: "Reference phone" }
	              ])}
	              {renderReadonlyRows("Other documents", form.candidatedocuments, [
	                { name: "type", label: "Type" },
	                { name: "documentname", label: "Document" },
	                { name: "link", label: "Link", link: true }
	              ])}
              <Typography variant="h6" fontWeight={800} sx={{ mt: 2 }}>Documents</Typography>
              {form.documents?.map((doc) => <Typography key={doc.url} sx={{ wordBreak: "break-all" }}><b>{doc.documenttype}:</b> {doc.url}</Typography>)}
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">Declaration: I certify that the information submitted is true to the best of my knowledge.</Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>Applicant signature/date</Grid>
                <Grid item xs={6}>Office use: Checked by / Approved by</Grid>
              </Grid>
            </Box>
          )}
        </Box>

        <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mt: 3 }}>
          <Button disabled={tab === 0} onClick={() => setTab((v) => v - 1)}>Back</Button>
          <Stack direction="row" spacing={1}>
            {pages[tab] === "Preview" && <Button startIcon={<PrintIcon />} variant="outlined" onClick={() => window.print()}>Print</Button>}
            {tab < pages.length - 1 ? <Button variant="contained" onClick={() => setTab((v) => v + 1)}>Next</Button> : <Button variant="contained" color="success" disabled={loading} onClick={validateAndSubmit}>Submit application</Button>}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
