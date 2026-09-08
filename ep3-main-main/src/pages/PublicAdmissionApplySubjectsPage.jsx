import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ep1 from "../api/ep1";

const fallbackAcademicYears = ["2026-27", "2027-28", "2028-29"];
const documentTypes = ["Photo", "Marksheet", "ID Card", "Admit Card", "Address Proof"];
const blankSubject = { subject: "", marks: "" };
const todayString = () => new Date().toISOString().slice(0, 10);

const calculateAge = (dateofbirth, dateofapplication) => {
  if (!dateofbirth || !dateofapplication) return "";
  const birthDate = new Date(dateofbirth);
  const applicationDate = new Date(dateofapplication);
  if (Number.isNaN(birthDate.getTime()) || Number.isNaN(applicationDate.getTime())) return "";
  let age = applicationDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = applicationDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && applicationDate.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : "";
};

const groupFieldsByPageAndSection = (items = []) => {
  const pageMap = new Map();
  items.forEach((field) => {
    const page = field.page || "Page 1";
    const section = field.section || "Additional Details";
    if (!pageMap.has(page)) pageMap.set(page, new Map());
    const sectionMap = pageMap.get(page);
    if (!sectionMap.has(section)) sectionMap.set(section, []);
    sectionMap.get(section).push(field);
  });

  return Array.from(pageMap.entries()).map(([page, sectionMap]) => ({
    page,
    sections: Array.from(sectionMap.entries()).map(([section, sectionFields]) => ({
      section,
      fields: sectionFields
    }))
  }));
};

const createInitialForm = () => ({
  academicyear: "2026-27",
  name: "",
  email: "",
  phone: "",
  address: "",
  pin: "",
  gender: "",
  category: "",
  ews: "No",
  ph: "No",
  minority: "No",
  tenthmarks: "",
  twelvemarks: "",
  externaltheorymarks: "",
  englishmarks: "",
  dateofbirth: "",
  dateofapplication: todayString(),
  age: "",
  twelvesubjects: "",
  programtype: "",
  programapplied: "",
  programcode: "",
  semester: "",
  admissionSubjects: [],
  tenthsubjectmarks: [{ ...blankSubject }],
  twelvesubjectmarks: [{ ...blankSubject }],
  documents: [],
  extraFields: {}
});

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const splitSubjects = (value) => String(value || "").split(",").map((item) => item.trim()).filter(Boolean);

export default function PublicAdmissionApplySubjectsPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const colid = query.get("colid");
  const formid = query.get("formid") || "default";
  const [institution, setInstitution] = useState(null);
  const [formDefinition, setFormDefinition] = useState(null);
  const [fields, setFields] = useState([]);
  const [academicSubjectRows, setAcademicSubjectRows] = useState([]);
  const [form, setForm] = useState(createInitialForm());
  const [saving, setSaving] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [message, setMessage] = useState("");
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [documentForm, setDocumentForm] = useState({
    documenttype: "Photo",
    description: "",
    file: null
  });

  useEffect(() => {
    if (colid) {
      loadInstitution();
      loadFormDefinition();
      loadFields();
      loadAcademicSubjects();
    }
  }, [colid, formid]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      programcode: prev.programapplied && prev.semester ? `${prev.programapplied} ${prev.semester}` : "",
      extraFields: {
        ...(prev.extraFields || {}),
        admission_stream: prev.programtype || "",
        admission_semester: prev.semester || "",
        admission_subjects: (prev.admissionSubjects || []).join(", ")
      }
    }));
  }, [form.programtype, form.programapplied, form.semester, form.admissionSubjects]);

  const loadInstitution = async () => {
    const res = await ep1.get(`/vins?colid=${colid}`);
    setInstitution(res.data || null);
  };

  const loadFormDefinition = async () => {
    const res = await ep1.get(`/admission-dynamic/form?colid=${colid}&formid=${encodeURIComponent(formid)}`);
    setFormDefinition(res.data || null);
  };

  const loadFields = async () => {
    const res = await ep1.get(`/admission-dynamic/fields?colid=${colid}&formid=${encodeURIComponent(formid)}`);
    setFields(res.data || []);
  };

  const loadAcademicSubjects = async () => {
    const res = await ep1.get("/api/v2/academicsubjects", { params: { colid, status: "Active" } });
    const rows = res.data?.data || [];
    setAcademicSubjectRows(rows);
    const years = uniqueSorted(rows.map((row) => row.academicyear));
    if (years.length && !years.includes(form.academicyear)) {
      setForm((prev) => ({ ...prev, academicyear: years[0] }));
    }
  };

  const academicYearOptions = useMemo(() => uniqueSorted([...fallbackAcademicYears, ...academicSubjectRows.map((row) => row.academicyear)]), [academicSubjectRows]);
  const streamOptions = useMemo(() => uniqueSorted(
    academicSubjectRows
      .filter((row) => !form.academicyear || row.academicyear === form.academicyear)
      .map((row) => row.stream)
  ), [academicSubjectRows, form.academicyear]);
  const programOptions = useMemo(() => uniqueSorted(
    academicSubjectRows
      .filter((row) => (!form.academicyear || row.academicyear === form.academicyear) && (!form.programtype || row.stream === form.programtype))
      .map((row) => row.program)
  ), [academicSubjectRows, form.academicyear, form.programtype]);
  const semesterOptions = useMemo(() => uniqueSorted(
    academicSubjectRows
      .filter((row) => (
        (!form.academicyear || row.academicyear === form.academicyear)
        && (!form.programtype || row.stream === form.programtype)
        && (!form.programapplied || row.program === form.programapplied)
      ))
      .map((row) => row.semester)
  ), [academicSubjectRows, form.academicyear, form.programtype, form.programapplied]);
  const subjectOptions = useMemo(() => uniqueSorted(
    academicSubjectRows
      .filter((row) => (
        (!form.academicyear || row.academicyear === form.academicyear)
        && (!form.programtype || row.stream === form.programtype)
        && (!form.programapplied || row.program === form.programapplied)
        && (!form.semester || row.semester === form.semester)
      ))
      .flatMap((row) => splitSubjects(row.subjects))
  ), [academicSubjectRows, form.academicyear, form.programtype, form.programapplied, form.semester]);
  const groupedFields = useMemo(() => groupFieldsByPageAndSection(fields), [fields]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateDateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      next.age = calculateAge(next.dateofbirth, next.dateofapplication);
      return next;
    });
  };

  const updateAcademicYear = (year) => {
    setForm((prev) => ({
      ...prev,
      academicyear: year,
      programtype: "",
      programapplied: "",
      programcode: "",
      semester: "",
      admissionSubjects: []
    }));
  };

  const updateStream = (stream) => {
    setForm((prev) => ({
      ...prev,
      programtype: stream,
      programapplied: "",
      programcode: "",
      semester: "",
      admissionSubjects: []
    }));
  };

  const updateProgram = (program) => {
    setForm((prev) => ({
      ...prev,
      programapplied: program,
      programcode: program && prev.semester ? `${program} ${prev.semester}` : "",
      admissionSubjects: []
    }));
  };

  const updateSemester = (semester) => {
    setForm((prev) => ({
      ...prev,
      semester,
      programcode: prev.programapplied && semester ? `${prev.programapplied} ${semester}` : "",
      admissionSubjects: []
    }));
  };

  const updateAdmissionSubjects = (subjects) => {
    setForm((prev) => ({
      ...prev,
      admissionSubjects: subjects
    }));
  };

  const updateExtra = (field, value) => {
    setForm((prev) => ({
      ...prev,
      extraFields: { ...(prev.extraFields || {}), [field]: value }
    }));
  };

  const updateSubject = (listName, index, field, value) => {
    setForm((prev) => {
      const list = [...prev[listName]];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [listName]: list };
    });
  };

  const addSubject = (listName) => {
    setForm((prev) => ({
      ...prev,
      [listName]: [...prev[listName], { ...blankSubject }]
    }));
  };

  const uploadDocument = async () => {
    if (!documentForm.documenttype || !documentForm.file) {
      setMessage("Please select document type and file before uploading.");
      return;
    }
    if (documentForm.documenttype === "Photo") {
      const fileName = documentForm.file.name || "";
      const extensionOk = /\.(jpe?g|png)$/i.test(fileName);
      const mimeOk = ["image/jpeg", "image/jpg", "image/png"].includes(documentForm.file.type);
      if (!extensionOk || !mimeOk) {
        setMessage("Photo must be a JPG, JPEG, or PNG file.");
        return;
      }
    }

    try {
      setUploadingDocument(true);
      setMessage("");
      const payload = new FormData();
      payload.append("colid", colid);
      payload.append("formid", formid);
      payload.append("documenttype", documentForm.documenttype);
      payload.append("description", documentForm.description || "");
      payload.append("file", documentForm.file);

      const res = await ep1.post("/admission-dynamic/application-document-upload", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setForm((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), res.data]
      }));
      setDocumentForm({ documenttype: "Photo", description: "", file: null });
      const fileInput = document.getElementById("admission-document-file");
      if (fileInput) fileInput.value = "";
      setMessage("Document uploaded successfully.");
    } catch (err) {
      setMessage(err.response?.data?.msg || "Unable to upload document. Please try again.");
    } finally {
      setUploadingDocument(false);
    }
  };

  const removeUploadedDocument = (index) => {
    setForm((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const submitApplication = async () => {
    if (!form.academicyear || !form.programtype || !form.programapplied || !form.semester || !form.admissionSubjects.length || !form.name || !form.email || !form.phone || !form.programcode) {
      setMessage("Please select year, stream, program, semester and subjects, and enter name, email and phone before submitting.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      const res = await ep1.post("/admission-dynamic/applications", {
        ...form,
        colid,
        formid,
        extraFields: {
          ...(form.extraFields || {}),
          admission_stream: form.programtype || "",
          admission_semester: form.semester || "",
          admission_subjects: (form.admissionSubjects || []).join(", ")
        },
        tenthsubjectmarks: form.tenthsubjectmarks.filter((row) => row.subject),
        twelvesubjectmarks: form.twelvesubjectmarks.filter((row) => row.subject)
      });
      setMessage(`Thank you. Your admission application has been submitted successfully. Application ID: ${res.data?._id || ""}`);
      setSubmittedApplication(res.data || null);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Unable to submit the application. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderText = (field, label, props = {}) => (
    <Grid item xs={12} md={props.md || 4}>
      <TextField
        fullWidth
        required={props.required}
        label={label}
        type={props.type || "text"}
        value={form[field] || ""}
        onChange={(event) => updateForm(field, event.target.value)}
        multiline={props.multiline}
        minRows={props.multiline ? 2 : undefined}
      />
    </Grid>
  );

  const renderSubjectRows = (title, listName) => (
    <Grid item xs={12}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography fontWeight={700}>{title}</Typography>
          <Button size="small" onClick={() => addSubject(listName)}>Add</Button>
        </Stack>
        {form[listName].map((row, index) => (
          <Grid container spacing={1} key={index} sx={{ mb: 1 }}>
            <Grid item xs={7}>
              <TextField fullWidth size="small" label="Subject" value={row.subject} onChange={(e) => updateSubject(listName, index, "subject", e.target.value)} />
            </Grid>
            <Grid item xs={5}>
              <TextField fullWidth size="small" type="number" label="Marks" value={row.marks} onChange={(e) => updateSubject(listName, index, "marks", e.target.value)} />
            </Grid>
          </Grid>
        ))}
      </Paper>
    </Grid>
  );

  const renderAckValue = (label, value) => (
    <Grid item xs={12} sm={6} md={3} key={label}>
      <Box className="ack-value" sx={{ border: "1px solid #cbd5e1", borderRadius: 0.75, px: 0.75, py: 0.5, minHeight: 42, bgcolor: "#fff" }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.1 }}>{label}</Typography>
        <Typography variant="caption" fontWeight={700} sx={{ display: "block", lineHeight: 1.25, wordBreak: "break-word" }}>{value || "-"}</Typography>
      </Box>
    </Grid>
  );

  const renderSubjectAck = (title, rows = []) => (
    <Grid item xs={12}>
      <Box className="compact-table" sx={{ border: "1px solid #cbd5e1", borderRadius: 0.75, overflow: "hidden" }}>
        <Typography variant="caption" sx={{ display: "block", bgcolor: "#e2e8f0", px: 1, py: 0.45, fontWeight: 900 }}>{title}</Typography>
        <Grid container>
          {(rows.length ? rows : [{ subject: "-", marks: "-" }]).map((row, index) => (
            <React.Fragment key={`${title}-${index}`}>
              <Grid item xs={8} sx={{ borderTop: "1px solid #e5e7eb", px: 1, py: 0.35 }}>
                <Typography variant="caption">{row.subject || "-"}</Typography>
              </Grid>
              <Grid item xs={4} sx={{ borderTop: "1px solid #e5e7eb", px: 1, py: 0.35, textAlign: "right" }}>
                <Typography variant="caption">{row.marks || "-"}</Typography>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </Box>
    </Grid>
  );

  if (submittedApplication) {
    const application = submittedApplication;
    const commonDetails = [
      ["Application ID", application._id],
      ["Academic Year", application.academicyear],
      ["Form ID", application.formid],
      ["Name", application.name],
      ["Email", application.email],
      ["Phone", application.phone],
      ["Address", application.address],
      ["Pin", application.pin],
      ["Gender", application.gender],
      ["Category", application.category],
      ["EWS", application.ews],
      ["PH", application.ph],
      ["Minority", application.minority],
      ["Stream", application.programtype],
      ["Program", application.programapplied],
      ["Semester", application.extraFields?.admission_semester],
      ["Selected Subjects", application.extraFields?.admission_subjects],
      ["Program Code", application.programcode],
      ["Tenth Marks", application.tenthmarks],
      ["Twelve Marks", application.twelvemarks],
      ["External Theory Marks", application.externaltheorymarks],
      ["English Marks", application.englishmarks],
      ["Date of Birth", application.dateofbirth],
      ["Date of Application", application.dateofapplication],
      ["Age", application.age],
      ["Twelve Subjects", application.twelvesubjects],
      ["Status", application.applicationstatus]
    ];
    const documents = application.documents || [];
    const photoDocument = documents.find((doc) => String(doc.documenttype || "").toLowerCase() === "photo" && doc.url);
    const dynamicDetails = fields
      .filter((field) => !["admission_stream", "admission_semester", "admission_subjects"].includes(field.fieldname))
      .map((field) => [field.label, application.extraFields?.[field.fieldname]])
      .filter((item) => item[1] !== undefined && item[1] !== "");

    return (
      <Box sx={{ bgcolor: "#f5f7fb", minHeight: "100vh", py: 2 }}>
        <style>
          {`
            @media print {
              @page { size: A4 portrait; margin: 6mm; }
              body * { visibility: hidden; }
              #admission-acknowledgement, #admission-acknowledgement * { visibility: visible; }
              #admission-acknowledgement { position: absolute; left: 0; top: 0; width: 198mm; box-shadow: none !important; border: 0 !important; padding: 4mm !important; }
              #admission-acknowledgement .MuiGrid-container { margin-top: -4px !important; width: calc(100% + 8px) !important; }
              #admission-acknowledgement .MuiGrid-item { padding-top: 4px !important; padding-left: 4px !important; }
              #admission-acknowledgement .ack-value { min-height: 30px !important; padding: 2px 5px !important; }
              #admission-acknowledgement .compact-table * { font-size: 9px !important; line-height: 1.15 !important; }
              #admission-acknowledgement p, #admission-acknowledgement span { font-size: 9px !important; line-height: 1.2 !important; }
              #admission-acknowledgement h6 { font-size: 14px !important; line-height: 1.15 !important; }
              .no-print { display: none !important; }
            }
          `}
        </style>
        <Stack className="no-print" direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => window.print()}>Print Acknowledgement</Button>
          <Button variant="outlined" onClick={() => {
            setSubmittedApplication(null);
            setForm(createInitialForm());
            setMessage("");
          }}>
            New Application
          </Button>
        </Stack>

        <Paper id="admission-acknowledgement" sx={{ maxWidth: "210mm", mx: "auto", p: 1.5, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
          <Grid container spacing={1} alignItems="flex-start">
            <Grid item xs={10}>
              <Stack alignItems="center" spacing={0.25} sx={{ textAlign: "center", pb: 0.75, borderBottom: "2px solid #1f2937" }}>
                {institution?.logolink && (
                  <Box component="img" src={institution.logolink} alt="Institution logo" sx={{ maxHeight: 46, maxWidth: 120, objectFit: "contain" }} />
                )}
                <Typography variant="subtitle1" fontWeight={900} sx={{ lineHeight: 1.15 }}>{institution?.institutionname || "Institution"}</Typography>
                <Typography variant="caption" sx={{ lineHeight: 1.15 }}>{institution?.address || ""}</Typography>
                <Typography variant="subtitle2" fontWeight={900} sx={{ lineHeight: 1.15 }}>Subject Admission Application Acknowledgement</Typography>
                <Typography variant="caption">{formDefinition?.title || "Admission Application"}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={2}>
              <Box sx={{ height: 92, border: "1.5px dashed #64748b", borderRadius: 0.75, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", p: 0.5 }}>
                {photoDocument ? (
                  <Box component="img" src={photoDocument.url} alt="Applicant" sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Photo</Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ bgcolor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 0.75, px: 1, py: 0.5, display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="caption"><b>Application ID:</b> {application._id}</Typography>
                <Typography variant="caption"><b>Submitted on:</b> {new Date(application.createdAt || Date.now()).toLocaleString("en-IN")}</Typography>
              </Box>
            </Grid>

            {commonDetails.map(([label, value]) => renderAckValue(label, value))}
            {dynamicDetails.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="caption" fontWeight={900} sx={{ display: "block", mt: 0.5 }}>Additional Details</Typography>
              </Grid>
            )}
            {dynamicDetails.map(([label, value]) => renderAckValue(label, value))}

            {renderSubjectAck("Tenth Subjects and Marks", application.tenthsubjectmarks || [])}
            {renderSubjectAck("Twelve Subjects and Marks", application.twelvesubjectmarks || [])}

            {documents.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, overflow: "hidden" }}>
                  <Typography variant="caption" sx={{ display: "block", bgcolor: "#e2e8f0", px: 1, py: 0.45, fontWeight: 900 }}>Uploaded Documents</Typography>
                  <Grid container sx={{ bgcolor: "#f8fafc", borderTop: "1px solid #cbd5e1" }}>
                    {["Document Type", "File", "Description"].map((heading) => (
                      <Grid item xs={4} key={heading} sx={{ px: 1, py: 0.35, borderRight: "1px solid #e5e7eb" }}>
                        <Typography variant="caption" fontWeight={900}>{heading}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                  {documents.map((doc, index) => (
                    <Grid container key={`${doc.key || doc.url || doc.filename}-${index}`} sx={{ borderTop: "1px solid #e5e7eb" }}>
                      <Grid item xs={4} sx={{ px: 1, py: 0.35 }}>
                        <Typography variant="caption">{doc.documenttype || "-"}</Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ px: 1, py: 0.35 }}>
                        <Typography variant="caption" sx={{ wordBreak: "break-word" }}>{doc.originalname || doc.filename || "-"}</Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ px: 1, py: 0.35 }}>
                        <Typography variant="caption">{doc.description || "-"}</Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 0.75, px: 1, py: 0.75, mt: 0.5 }}>
                <Typography variant="caption" fontWeight={900}>Declaration</Typography>
                <Typography variant="caption" sx={{ display: "block", mt: 0.25 }}>
                  I hereby declare that the information submitted in this application is true and correct to the best of my knowledge. I understand that admission is subject to verification of documents, eligibility, seat availability, and the rules and regulations of the institution. If any information is found incorrect or incomplete, my application/admission may be cancelled by the institution.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{ height: 38, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.25 }}>
                <Typography variant="caption">Applicant Signature</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ height: 38, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.25 }}>
                <Typography variant="caption">Date</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ border: "1.5px solid #1f2937", borderRadius: 0.75, p: 1, mt: 0.5 }}>
                <Typography variant="caption" fontWeight={900} sx={{ display: "block", mb: 0.5 }}>For Office Use Only</Typography>
                <Grid container spacing={1}>
                  {["Documents Checked By", "Eligibility Verified By", "Approved By", "Remarks"].map((label) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ height: 34, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.25 }}>
                        <Typography variant="caption">{label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }

  if (!colid) {
    return (
      <Box sx={{ maxWidth: 760, mx: "auto", p: 3 }}>
        <Alert severity="error">Admission link is invalid. Institution id is missing.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f7fb", minHeight: "100vh", py: 3 }}>
      <Grid container spacing={2} sx={{ maxWidth: 1100, mx: "auto", px: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            {institution?.logolink && (
              <Box component="img" src={institution.logolink} alt="Institution logo" sx={{ maxHeight: 90, maxWidth: 180, objectFit: "contain", mb: 1 }} />
            )}
            <Typography variant="h5" fontWeight={700}>{institution?.institutionname || "Admission Form"}</Typography>
            <Typography color="text.secondary">{institution?.address || ""}</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>{formDefinition?.title || "Admission Application"}</Typography>
            {formDefinition?.description && <Typography color="text.secondary">{formDefinition.description}</Typography>}
          </Paper>
        </Grid>

        {message && (
          <Grid item xs={12}>
            <Alert severity={message.startsWith("Thank you") ? "success" : "warning"}>{message}</Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => updateAcademicYear(e.target.value)}>
                  {academicYearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth required label="Stream" value={form.programtype} onChange={(e) => updateStream(e.target.value)}>
                  {streamOptions.map((stream) => <MenuItem key={stream} value={stream}>{stream}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Program"
                  value={form.programapplied}
                  disabled={!form.programtype}
                  onChange={(e) => updateProgram(e.target.value)}
                >
                  {programOptions.map((program) => <MenuItem key={program} value={program}>{program}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth required label="Semester" value={form.semester} disabled={!form.programapplied} onChange={(e) => updateSemester(e.target.value)}>
                  {semesterOptions.map((semester) => <MenuItem key={semester} value={semester}>{semester}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Subjects"
                  value={form.admissionSubjects}
                  disabled={!form.semester}
                  onChange={(e) => updateAdmissionSubjects(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => selected.join(", ")
                  }}
                >
                  {subjectOptions.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      <Checkbox checked={form.admissionSubjects.indexOf(subject) > -1} />
                      <ListItemText primary={subject} />
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Program Code" value={form.programcode} disabled />
              </Grid>
              {renderText("name", "Name", { required: true })}
              {renderText("email", "Email", { required: true })}
              {renderText("phone", "Phone", { required: true })}
              {renderText("address", "Address", { md: 8, multiline: true })}
              {renderText("pin", "Pin")}
              <Grid item xs={12} md={4}>
                <TextField select fullWidth label="Gender" value={form.gender} onChange={(e) => updateForm("gender", e.target.value)}>
                  {["Male", "Female", "Not specified"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth label="Category" value={form.category} onChange={(e) => updateForm("category", e.target.value)}>
                  {["General", "SC", "ST", "OBC"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </TextField>
              </Grid>
              {["ews", "ph", "minority"].map((field) => (
                <Grid item xs={12} md={4} key={field}>
                  <TextField select fullWidth label={field.toUpperCase()} value={form[field]} onChange={(e) => updateForm(field, e.target.value)}>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>
                </Grid>
              ))}
              {renderText("tenthmarks", "TenthMarks", { type: "number" })}
              {renderText("twelvemarks", "TwelveMarks", { type: "number" })}
              {renderText("externaltheorymarks", "External Theory Marks", { type: "number" })}
              {renderText("englishmarks", "English Marks", { type: "number" })}
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} value={form.dateofbirth || ""} onChange={(e) => updateDateField("dateofbirth", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="date" label="Date of Application" InputLabelProps={{ shrink: true }} value={form.dateofapplication || ""} onChange={(e) => updateDateField("dateofapplication", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Age" value={form.age || ""} disabled />
              </Grid>
              {renderText("twelvesubjects", "Twelve Subjects", { md: 8 })}

              {renderSubjectRows("Tenth Subjects and Marks", "tenthsubjectmarks")}
              {renderSubjectRows("Twelve Subjects and Marks", "twelvesubjectmarks")}

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography fontWeight={800} sx={{ mb: 1 }}>Upload Documents</Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <TextField
                        select
                        fullWidth
                        label="Document Type"
                        value={documentForm.documenttype}
                        onChange={(e) => setDocumentForm((prev) => ({ ...prev, documenttype: e.target.value }))}
                      >
                        {documentTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={documentForm.description}
                        onChange={(e) => setDocumentForm((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button fullWidth variant="outlined" component="label" sx={{ minHeight: 56 }}>
                        {documentForm.file ? documentForm.file.name : "Choose File"}
                        <input
                          id="admission-document-file"
                          type="file"
                          accept={documentForm.documenttype === "Photo" ? ".jpg,.jpeg,.png,image/jpeg,image/png" : undefined}
                          hidden
                          onChange={(e) => setDocumentForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                        />
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button fullWidth variant="contained" onClick={uploadDocument} disabled={uploadingDocument}>
                        {uploadingDocument ? "Uploading..." : "Upload"}
                      </Button>
                    </Grid>
                  </Grid>

                  {(form.documents || []).length > 0 && (
                    <Box sx={{ mt: 2, border: "1px solid #e5e7eb", borderRadius: 1, overflow: "hidden" }}>
                      {(form.documents || []).map((doc, index) => (
                        <Stack
                          key={`${doc.key || doc.url || doc.filename}-${index}`}
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          justifyContent="space-between"
                          sx={{ px: 1.5, py: 1, borderTop: index ? "1px solid #e5e7eb" : 0 }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={800}>{doc.documenttype}</Typography>
                            <Typography variant="caption" color="text.secondary">{doc.originalname || doc.filename}</Typography>
                            {doc.description && <Typography variant="caption" sx={{ display: "block" }}>{doc.description}</Typography>}
                          </Box>
                          <IconButton size="small" color="error" onClick={() => removeUploadedDocument(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {groupedFields.map((pageGroup) => (
                <Grid item xs={12} key={pageGroup.page}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>{pageGroup.page}</Typography>
                    <Stack spacing={2}>
                      {pageGroup.sections.map((sectionGroup) => (
                        <Box key={`${pageGroup.page}-${sectionGroup.section}`}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>{sectionGroup.section}</Typography>
                          <Grid container spacing={2}>
                            {sectionGroup.fields.map((field) => (
                              <Grid item xs={12} md={field.type === "textarea" ? 12 : 4} key={field._id}>
                                <TextField
                                  select={field.type === "dropdown"}
                                  fullWidth
                                  required={field.isrequired === "Yes"}
                                  label={field.label}
                                  type={field.type === "number" || field.type === "date" ? field.type : "text"}
                                  multiline={field.type === "textarea"}
                                  minRows={field.type === "textarea" ? 2 : undefined}
                                  value={form.extraFields?.[field.fieldname] || ""}
                                  onChange={(e) => updateExtra(field.fieldname, e.target.value)}
                                >
                                  {(field.options || []).map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                                </TextField>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Button variant="contained" size="large" onClick={submitApplication} disabled={saving}>
                  {saving ? "Submitting..." : "Submit Application"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
