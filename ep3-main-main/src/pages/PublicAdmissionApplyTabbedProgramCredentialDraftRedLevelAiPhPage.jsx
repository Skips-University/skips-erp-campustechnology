import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import ep1 from "../api/ep1";

const academicYears = ["2026-27", "2027-28", "2028-29"];
const educationResultStatuses = ["Awaited", "Declared"];
const marksTypes = ["CGPA", "Percentage", "Grade"];
const cbseGrades = ["A1", "A2", "B1", "B2", "C1", "C2", "D", "E1", "E2"];
const educationPanelMap = {
  educationpanel10th: { level: "10th", resultStatusField: "result_status_10th", institutionField: "board_10th", marksTypeField: "marks_type_10th", marksField: "marks_10", cgpaField: "cgpa_10", title: "10th Details", institutionLabel: "Board" },
  educationpanel12th: { level: "12th", resultStatusField: "result_status_12th", institutionField: "board_12th", marksTypeField: "marks_type_12th", marksField: "marks_12", cgpaField: "cgpa_12", title: "12th Details", institutionLabel: "Board" },
  educationpanelug: { level: "UG", resultStatusField: "result_status_UG", institutionField: "University_UG", marksTypeField: "marks_type_UG", marksField: "marks_UG", cgpaField: "cgpa_UG", title: "UG Details", institutionLabel: "University" },
  educationpanelpg: { level: "PG", resultStatusField: "result_status_PG", institutionField: "University_PG", marksTypeField: "marks_type_PG", marksField: "marks_PG", cgpaField: "cgpa_PG", title: "PG Details", institutionLabel: "University" }
};
const documentTypes = [
  "Photo",
  "Admit Card",
  "10th Marksheet",
  "12th Marksheet",
  "Aadhar card",
  "Leaving or Transfer certificate",
  "Caste certificate",
  "Migration certificate"
];
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

const programOrderValue = (program) => {
  const value = Number(program?.Order ?? program?.order ?? 0);
  return Number.isNaN(value) ? 0 : value;
};

const sortProgramsByOrder = (items = []) => [...items].sort((a, b) => {
  const orderDiff = programOrderValue(a) - programOrderValue(b);
  if (orderDiff !== 0) return orderDiff;
  return String(a.program || a.name || "").localeCompare(String(b.program || b.name || ""));
});

const groupOrderValue = (items = []) => {
  const orders = items
    .map((program) => programOrderValue(program))
    .filter((value) => value > 0);
  return orders.length ? Math.min(...orders) : Number.MAX_SAFE_INTEGER;
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
  country_form: "",
  state_form: "",
  district_form: "",
  board_12th: "",
  result_status_12th: "",
  marks_type_12th: "",
  marks_12: "",
  cgpa_12: "",
  board_10th: "",
  result_status_10th: "",
  marks_type_10th: "",
  marks_10: "",
  cgpa_10: "",
  University_UG: "",
  result_status_UG: "",
  marks_type_UG: "",
  marks_UG: "",
  cgpa_UG: "",
  University_PG: "",
  result_status_PG: "",
  marks_type_PG: "",
  marks_PG: "",
  cgpa_PG: "",
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
  level: "",
  programtype: "",
  programapplied: "",
  programcode: "",
  username: "",
  password: "",
  tenthsubjectmarks: [],
  twelvesubjectmarks: [],
  documents: [],
  validationstatus: "",
  validationcomments: "",
  extraFields: {}
});

const createDocumentForms = () => Object.fromEntries(documentTypes.map((type) => [type, { description: "", file: null }]));

const applicationToForm = (application = {}) => ({
  ...createInitialForm(),
  ...application,
  tenthsubjectmarks: [],
  twelvesubjectmarks: [],
  documents: application.documents || [],
  extraFields: application.extraFields || {}
});

const normalizeValidationIssues = (result = {}) => {
  const issues = Array.isArray(result.criteriaissues) ? result.criteriaissues : [];
  const aiIssues = Array.isArray(result.ai?.criteriaissues) ? result.ai.criteriaissues : [];
  const merged = [...issues, ...aiIssues].filter((issue) => issue && String(issue.status || "").toLowerCase() === "fail");
  if (merged.length) {
    return merged.map((issue, index) => ({
      id: `${issue.criteriaType || issue.type || "Issue"}-${issue.tab || "General"}-${issue.field || index}-${index}`,
      criteriaType: issue.criteriaType || issue.type || "Other",
      tab: issue.tab || "General",
      field: issue.field || issue.check || "General",
      comment: issue.comment || issue.message || issue.check || "Please review this field."
    }));
  }
  if (String(result.validationstatus || "").toLowerCase() === "fail") {
    return [{
      id: "validation-general",
      criteriaType: result.mandatoryFailed ? "Mandatory" : "Other",
      tab: "General",
      field: "Application",
      comment: result.validationcomments || result.summary || "Validation failed. Please review the application details."
    }];
  }
  return [];
};

export default function PublicAdmissionApplyTabbedProgramCredentialDraftRedLevelAiPhPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const colid = query.get("colid");
  const formid = query.get("formid") || "default";
  const [institution, setInstitution] = useState(null);
  const [formDefinition, setFormDefinition] = useState(null);
  const [fields, setFields] = useState([]);
  const [addressRows, setAddressRows] = useState([]);
  const [boardRows, setBoardRows] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [programTypes, setProgramTypes] = useState([]);
  const [programsByType, setProgramsByType] = useState({});
  const [form, setForm] = useState(createInitialForm());
  const [applicationId, setApplicationId] = useState("");
  const [retrieveUsername, setRetrieveUsername] = useState("");
  const [retrievePassword, setRetrievePassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [isDraftEditable, setIsDraftEditable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validatingApplication, setValidatingApplication] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [message, setMessage] = useState("");
  const [validationSummary, setValidationSummary] = useState(null);
  const [validationIssues, setValidationIssues] = useState([]);
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [applicationFee, setApplicationFee] = useState(null);
  const [provisionalFee, setProvisionalFee] = useState(null);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [selectedPaymentGatewayId, setSelectedPaymentGatewayId] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activePaymentTab, setActivePaymentTab] = useState(0);
  const [documentForms, setDocumentForms] = useState(createDocumentForms());
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const admissionLevel = form.level || "";

  useEffect(() => {
    if (colid) {
      loadInstitution();
      loadFormDefinition();
      loadFields();
      loadLevels();
      loadAddressRows();
      loadBoardRows();
      loadPaymentGateways();
    }
  }, [colid, formid]);

  useEffect(() => {
    if (colid && form.academicyear && admissionLevel) {
      loadProgramTypes(form.academicyear);
    } else {
      setProgramTypes([]);
      setProgramsByType({});
    }
  }, [colid, form.academicyear, admissionLevel]);

  useEffect(() => {
    if (colid && form.academicyear && programTypes.length) {
      loadProgramsByType(form.academicyear, programTypes);
    } else {
      setProgramsByType({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colid, form.academicyear, admissionLevel, programTypes.join("|")]);

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

  const loadAddressRows = async () => {
    try {
      const res = await ep1.get("/admission-address-configuration", { params: { colid, isactive: "Yes" } });
      setAddressRows(res.data || []);
    } catch (err) {
      setAddressRows([]);
    }
  };

  const loadBoardRows = async () => {
    try {
      const res = await ep1.get("/admission-board-configuration", { params: { colid, isactive: "Yes" } });
      setBoardRows(res.data || []);
    } catch (err) {
      setBoardRows([]);
    }
  };

  const loadLevels = async () => {
    try {
      const res = await ep1.get(`/admission-dynamic/program-levels?colid=${colid}`);
      setLevelOptions(res.data || []);
    } catch (err) {
      setLevelOptions([]);
    }
  };

  const loadPaymentGateways = async () => {
    try {
      const res = await ep1.get("/api/v2/mastergateway", { params: { colid, status: "Active" } });
      const activeGateways = res.data?.data || [];
      setPaymentGateways(activeGateways);
      const defaultGateway = activeGateways.find((item) => item.default === "Yes") || activeGateways[0];
      if (defaultGateway) setSelectedPaymentGatewayId(defaultGateway._id);
    } catch (err) {
      setPaymentGateways([]);
    }
  };

  const loadDraftApplication = async () => {
    const cleanUsername = String(retrieveUsername || "").trim();
    const cleanPassword = String(retrievePassword || "").trim();
    if (!colid || !cleanUsername || !cleanPassword) {
      setMessage("Please enter both username and password to retrieve.");
      return;
    }
    try {
      setSaving(true);
      setMessage("");
      setSubmittedApplication(null);
      setApplicationFee(null);
      setProvisionalFee(null);
      const res = await ep1.post("/admission-dynamic/application-credential-retrieve", {
        colid,
        formid,
        username: cleanUsername,
        password: cleanPassword
      });
      const application = res.data || null;
      if (!application) {
        setMessage("Application not found.");
        return;
      }
      setApplicationId(application._id || "");
      setRetrieveUsername(application.username || cleanUsername);
      setRetrievePassword(application.password || cleanPassword);
      setForgotEmail(application.email || "");
      setForm(applicationToForm(application));
      const draft = application.applicationstatus === "Draft";
      setIsDraftEditable(draft);
      setMessage(draft ? "Draft application loaded. You can continue editing." : "This application is already submitted and cannot be edited here.");
      if (!draft) {
        const [fee, provisional] = await Promise.all([
          getApplicationFeeForApplication(application),
          getProvisionalFeeForApplication(application)
        ]);
        setApplicationFee(fee);
        setProvisionalFee(provisional);
        setSubmittedApplication(application);
      }
    } catch (err) {
      setMessage(err.response?.data?.msg || "Unable to retrieve application.");
    } finally {
      setSaving(false);
    }
  };

  const sendForgotPassword = async () => {
    const cleanEmail = String(forgotEmail || "").trim();
    if (!cleanEmail) {
      setMessage("Please enter email for forgot password.");
      return;
    }
    try {
      setSaving(true);
      setMessage("");
      const res = await ep1.post("/admission-dynamic/application-forgot-password", {
        colid,
        formid,
        email: cleanEmail
      });
      setMessage(res.data?.msg || "Login details sent to email.");
    } catch (err) {
      setMessage(err.response?.data?.msg || "Unable to send login details.");
    } finally {
      setSaving(false);
    }
  };

  const loadProgramTypes = async (year) => {
    const levelPart = admissionLevel ? `&level=${encodeURIComponent(admissionLevel)}` : "";
    const res = await ep1.get(`/admission-dynamic/program-types?colid=${colid}&year=${encodeURIComponent(year)}${levelPart}`);
    setProgramTypes(res.data || []);
  };

  const loadProgramsByType = async (year, types) => {
    const levelPart = admissionLevel ? `&level=${encodeURIComponent(admissionLevel)}` : "";
    const responses = await Promise.all(types.map(async (type) => {
      const res = await ep1.get(`/admission-dynamic/programs?colid=${colid}&year=${encodeURIComponent(year)}&type=${encodeURIComponent(type)}${levelPart}`);
      return [type, sortProgramsByOrder(res.data || [])];
    }));
    const sortedResponses = [...responses].sort((a, b) => {
      const orderDiff = groupOrderValue(a[1]) - groupOrderValue(b[1]);
      if (orderDiff !== 0) return orderDiff;
      return String(a[0]).localeCompare(String(b[0]));
    });
    const grouped = Object.fromEntries(sortedResponses);
    setProgramsByType(grouped);
  };

  const groupedProgramOptions = useMemo(() => Object.entries(programsByType).map(([type, items]) => ({
    type,
    programs: items.map((program) => ({
      label: program.program || program.name || "",
      type,
      program: program.program || program.name || "",
      programcode: program.programcode || ""
    }))
  })).filter((group) => group.programs.length).sort((a, b) => {
    const orderDiff = groupOrderValue(programsByType[a.type]) - groupOrderValue(programsByType[b.type]);
    if (orderDiff !== 0) return orderDiff;
    return String(a.type).localeCompare(String(b.type));
  }), [programsByType]);
  const groupedFields = useMemo(() => groupFieldsByPageAndSection(fields), [fields]);

  const updateForm = (field, value) => {
    setValidationIssues([]);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateDateField = (field, value) => {
    setValidationIssues([]);
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      next.age = calculateAge(next.dateofbirth, todayString());
      next.dateofapplication = todayString();
      return next;
    });
  };

  const updateAcademicYear = (year) => {
    setValidationIssues([]);
    setForm((prev) => ({
      ...prev,
      academicyear: year,
      programtype: "",
      programapplied: "",
      programcode: ""
    }));
  };

  const updateLevel = (level) => {
    setValidationIssues([]);
    setForm((prev) => ({
      ...prev,
      level,
      programtype: "",
      programapplied: "",
      programcode: ""
    }));
  };

  const updateEmailAndUsername = (email) => {
    setValidationIssues([]);
    setForm((prev) => ({
      ...prev,
      email,
      username: email
    }));
  };

  const selectGroupedProgram = (programcode) => {
    setValidationIssues([]);
    const selected = groupedProgramOptions.flatMap((group) => group.programs).find((program) => program.programcode === programcode);
    setForm((prev) => ({
      ...prev,
      programtype: selected?.type || "",
      programcode: selected?.programcode || "",
      programapplied: selected?.program || ""
    }));
  };

  const updateExtra = (field, value) => {
    setValidationIssues([]);
    setForm((prev) => ({
      ...prev,
      extraFields: { ...(prev.extraFields || {}), [field]: value }
    }));
  };

  const countryOptions = useMemo(() => [...new Set(addressRows.map((row) => row.country).filter(Boolean))].sort(), [addressRows]);
  const stateOptions = useMemo(() => [...new Set(addressRows.filter((row) => row.country === form.country_form).map((row) => row.state).filter(Boolean))].sort(), [addressRows, form.country_form]);
  const districtOptions = useMemo(() => [...new Set(addressRows.filter((row) => row.country === form.country_form && row.state === form.state_form).map((row) => row.district).filter(Boolean))].sort(), [addressRows, form.country_form, form.state_form]);

  const updateAddressPanel = (field, value) => {
    setValidationIssues([]);
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "country_form") {
        next.state_form = "";
        next.district_form = "";
      }
      if (field === "state_form") next.district_form = "";
      return next;
    });
  };

  const boardOptionsByLevel = (level) => [...new Set(boardRows.filter((row) => row.level === level).map((row) => row.board).filter(Boolean))].sort();

  const updateEducationPanel = (config, field, value) => {
    setValidationIssues([]);
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === config.resultStatusField && value === "Awaited") {
        next[config.institutionField] = "";
        next[config.marksTypeField] = "";
        next[config.marksField] = 0;
        next[config.cgpaField] = "NA";
      }
      if (field === config.marksTypeField) {
        if (value === "CGPA" || value === "Grade") next[config.marksField] = 0;
        if (value === "Percentage") next[config.cgpaField] = "NA";
      }
      return next;
    });
  };

  const renderEducationPanel = (type, required = false) => {
    const config = educationPanelMap[type];
    if (!config) return null;
    const resultStatus = form[config.resultStatusField] || "";
    const marksType = form[config.marksTypeField] || "";
    const isDeclared = resultStatus === "Declared";
    const showNumber = marksType === "Percentage" || marksType === "CGPA";
    const showGrade = marksType === "Grade";
    return (
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fff" }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>{config.title}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth required={required} label="Result Status" value={resultStatus} onChange={(e) => updateEducationPanel(config, config.resultStatusField, e.target.value)}>
                {educationResultStatuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            {isDeclared && (
              <Grid item xs={12} md={4}>
                <TextField select fullWidth required={required} label={config.institutionLabel} value={form[config.institutionField] || ""} onChange={(e) => updateEducationPanel(config, config.institutionField, e.target.value)}>
                  {boardOptionsByLevel(config.level).map((board) => <MenuItem key={board} value={board}>{board}</MenuItem>)}
                </TextField>
              </Grid>
            )}
            {isDeclared && (
              <Grid item xs={12} md={4}>
                <TextField select fullWidth required={required} label="Marks Type" value={marksType} onChange={(e) => updateEducationPanel(config, config.marksTypeField, e.target.value)}>
                  {marksTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            )}
            {isDeclared && showNumber && (
              <Grid item xs={12} md={4}>
                <TextField fullWidth required={required} type="number" label={marksType === "CGPA" ? "CGPA" : "Marks / Percentage"} value={marksType === "CGPA" ? (form[config.cgpaField] || "") : (form[config.marksField] || "")} onChange={(e) => updateEducationPanel(config, marksType === "CGPA" ? config.cgpaField : config.marksField, e.target.value)} />
              </Grid>
            )}
            {isDeclared && showGrade && (
              <Grid item xs={12} md={4}>
                <TextField select fullWidth required={required} label="Grade" value={form[config.cgpaField] || ""} onChange={(e) => updateEducationPanel(config, config.cgpaField, e.target.value)}>
                  {cbseGrades.map((grade) => <MenuItem key={grade} value={grade}>{grade}</MenuItem>)}
                </TextField>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    );
  };

  const renderAddressPanel = (required = false) => (
    <Grid item xs={12}>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fff" }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Address Selection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth required={required} label="Country" value={form.country_form || ""} onChange={(e) => updateAddressPanel("country_form", e.target.value)}>
              {countryOptions.map((country) => <MenuItem key={country} value={country}>{country}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth required={required} label="State" value={form.state_form || ""} disabled={!form.country_form} onChange={(e) => updateAddressPanel("state_form", e.target.value)}>
              {stateOptions.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth required={required} label="District" value={form.district_form || ""} disabled={!form.state_form} onChange={(e) => updateAddressPanel("district_form", e.target.value)}>
              {districtOptions.map((district) => <MenuItem key={district} value={district}>{district}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );

  const uploadDocument = async (documenttype) => {
    const currentDocument = documentForms[documenttype] || {};
    if (!documenttype || !currentDocument.file) {
      setMessage("Please select a file before uploading.");
      return;
    }
    if (documenttype === "Photo") {
      const fileName = currentDocument.file.name || "";
      const extensionOk = /\.(jpe?g|png)$/i.test(fileName);
      const mimeOk = ["image/jpeg", "image/jpg", "image/png"].includes(currentDocument.file.type);
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
      payload.append("documenttype", documenttype);
      payload.append("description", currentDocument.description || "");
      payload.append("file", currentDocument.file);

      const res = await ep1.post("/admission-dynamic/application-document-upload", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setForm((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), res.data]
      }));
      setDocumentForms((prev) => ({
        ...prev,
        [documenttype]: { description: "", file: null }
      }));
      const fileInput = document.getElementById(`admission-document-file-${documenttype.replace(/[^a-z0-9]/gi, "-")}`);
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

  const getApplicationFeeForApplication = async (application) => {
    const res = await ep1.get("/api/v2/applicationfee", {
      params: {
        colid,
        academicyear: application.academicyear,
        programcode: application.programcode,
        active: "Yes"
      }
    });
    const fees = res.data?.data || [];
    return fees.find((item) => Number(item.amount || 0) > 0) || null;
  };

  const getProvisionalFeeForApplication = async (application) => {
    const res = await ep1.get("/api/v2/provisionaladmissionfee", {
      params: {
        colid,
        academicyear: application.academicyear,
        programcode: application.programcode
      }
    });
    const fees = res.data?.data || [];
    return fees.find((item) => Number(item.amount || 0) > 0) || null;
  };

  const makeAdmissionPayment = async (paymentKind, application = submittedApplication) => {
    const selectedFee = paymentKind === "Provisional" ? provisionalFee : applicationFee;
    if (!application || !selectedFee) return;
    const selectedGateway = paymentGateways.find((item) => item._id === selectedPaymentGatewayId);
    try {
      setPaymentLoading(true);
      setMessage("");
      const applicationId = String(application._id || application.id || application.applicationid || "").trim();
      const regnoForPayment = applicationId || String(application.email || form.email || application.phone || form.phone || "").trim();
      const studentName = String(application.name || form.name || application.email || "Admission Applicant").trim();
      const programName = String(application.programapplied || application.program || application.programcode || "Admission").trim();
      const feeItem = paymentKind === "Provisional" ? "Provisional Admission Fee" : "Application Fee";
      const feeAmount = Number(selectedFee.amount || selectedFee.feeamount || 0);
      if (!colid || !studentName || !regnoForPayment || !feeItem || feeAmount <= 0) {
        setMessage(`Unable to initiate payment. ${feeItem} details are incomplete.`);
        return;
      }
      const normalizedGatewayName = String(selectedGateway?.gatewayname || "").replace(/\s|-/g, "").toLowerCase();
      const useExternalGateway = selectedGateway?.type === "External" && !normalizedGatewayName.includes("easebuzz");
      if (useExternalGateway) {
        if (!selectedGateway.externallink) {
          setMessage("Selected gateway is not configured with an external payment link.");
          return;
        }
        const params = new URLSearchParams({
          colid: String(colid || ""),
          applicationid: applicationId,
          student: studentName,
          name: studentName,
          email: application.email || form.email || "",
          phone: application.phone || form.phone || "",
          academicyear: application.academicyear || "",
          program: application.programapplied || "",
          programcode: application.programcode || "",
          feeitem: feeItem,
          amount: String(feeAmount),
          type: "Admission",
          paymentfor: paymentKind,
          gateway: selectedGateway.gatewayname || "",
          returnurl: selectedGateway.callbackurl || window.location.href
        });
        const joiner = selectedGateway.externallink.includes("?") ? "&" : "?";
        window.location.assign(`${selectedGateway.externallink}${joiner}${params.toString()}`);
        return;
      }
      const paymentPayload = {
        colid,
        user: studentName,
        name: studentName,
        student: studentName,
        regno: regnoForPayment,
        feeitem: feeItem,
        amount: String(feeAmount),
        type: "Admission",
        paymentfor: paymentKind,
        applicationid: applicationId,
        description: `${feeItem} for ${programName}`,
        email: application.email || form.email || "",
        phone: application.phone || form.phone || ""
      };
      let paymentResponse = null;
      let initiationError = null;
      try {
        const paymentEndpoint = normalizedGatewayName.includes("icici") ? "/api/v2/icicipayment/initiate" : "/api/v2/easebuzzpayment/initiate";
        paymentResponse = await ep1.post(paymentEndpoint, { ...paymentPayload, gateway: selectedGateway?.gatewayname || "", frontendcallbackurl: window.location.href });
      } catch (error) {
        initiationError = error;
      }
      let paymentUrl =
        paymentResponse?.data?.data?.paymenturl ||
        paymentResponse?.data?.data?.paymentUrl ||
        paymentResponse?.data?.data?.payment_url ||
        paymentResponse?.data?.paymenturl ||
        paymentResponse?.data?.paymentUrl ||
        paymentResponse?.data?.payment_url ||
        paymentResponse?.data?.url ||
        paymentResponse?.data?.redirectUrl;
      if (paymentUrl) window.location.href = paymentUrl;
      else setMessage(initiationError?.response?.data?.message || initiationError?.message || "Payment was initiated but payment URL was not returned.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to initiate payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const applicationPayload = (status = "Draft") => ({
    ...form,
    id: applicationId || undefined,
    colid,
    formid,
    username: form.email || form.username || "",
    dateofapplication: todayString(),
    age: calculateAge(form.dateofbirth, todayString()),
    applicationstatus: status,
    tenthmarks: 0,
    twelvemarks: 0,
    externaltheorymarks: 0,
    englishmarks: 0,
    twelvesubjects: "",
    tenthsubjectmarks: [],
    twelvesubjectmarks: [],
    validationstatus: form.validationstatus || "",
    validationcomments: form.validationcomments || ""
  });

  const validateEducationPanels = () => {
    const activeEducationPanels = fields.filter((field) => educationPanelMap[field.type]);
    for (const field of activeEducationPanels) {
      const config = educationPanelMap[field.type];
      const resultStatus = form[config.resultStatusField];
      const marksType = form[config.marksTypeField];
      const hasAnyValue = field.isrequired === "Yes" || resultStatus || form[config.institutionField] || marksType || form[config.marksField] || form[config.cgpaField];
      if (!hasAnyValue) continue;
      if (!resultStatus) {
        setMessage(`${config.title}: result status is required.`);
        return false;
      }
      if (resultStatus === "Awaited") continue;
      if (!form[config.institutionField] || !marksType) {
        setMessage(`${config.title}: ${config.institutionLabel} and marks type are required.`);
        return false;
      }
      if (marksType === "Percentage" && form[config.marksField] === "") {
        setMessage(`${config.title}: marks/percentage is required.`);
        return false;
      }
      if (marksType === "Percentage" && (Number(form[config.marksField]) < 0 || Number(form[config.marksField]) > 100)) {
        setMessage(`${config.title}: marks/percentage must be between 0 and 100.`);
        return false;
      }
      if (marksType === "CGPA" && form[config.cgpaField] === "") {
        setMessage(`${config.title}: CGPA is required.`);
        return false;
      }
      if (marksType === "Grade" && !form[config.cgpaField]) {
        setMessage(`${config.title}: grade is required.`);
        return false;
      }
    }
    return true;
  };

  const validateApplicationWithAi = async (payload) => {
    setValidatingApplication(true);
    setValidationSummary(null);
    const res = await ep1.post("/admission-dynamic/validate-application-ai", {
      ...payload,
      colid,
      formid
    });
    const result = res.data || {};
    const comments = result.validationcomments || result.summary || "";
    const validation = {
      validationstatus: result.validationstatus || "Fail",
      validationcomments: comments,
      mandatoryFailed: !!result.mandatoryFailed,
      criteriaissues: result.criteriaissues || result.ai?.criteriaissues || []
    };
    const issues = normalizeValidationIssues({ ...result, ...validation });
    setValidationIssues(issues);
    setValidationSummary({ ...result, ...validation });
    return validation;
  };

  const saveDraft = async () => {
    if (!isDraftEditable) {
      setMessage("Submitted application cannot be edited.");
      return null;
    }
    if (!form.name || !form.email || !form.phone || !form.username || !form.password) {
      setMessage("Name, email, phone, username and password are required before saving a draft.");
      return null;
    }

    try {
      setSaving(true);
      setMessage("");
      const res = await ep1.post("/admission-dynamic/applications-draft-save", applicationPayload("Draft"));
      setApplicationId(res.data?._id || "");
      setForm(applicationToForm(res.data));
      setIsDraftEditable(true);
      setMessage(`Draft saved successfully. Application ID: ${res.data?._id || ""}`);
      return res.data;
    } catch (err) {
      setMessage(err.response?.data?.msg || "Unable to save draft. Please try again.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const saveCurrentTab = async () => {
    const saved = await saveDraft();
    if (saved && activeTab === 0) setActiveTab(1);
  };

  const submitApplication = async () => {
    if (!form.academicyear || !form.level || !form.programtype || !form.name || !form.email || !form.phone || !form.username || !form.password || !form.programcode) {
      setMessage("Please select year, level and program, and enter name, email, phone, username and password before submitting.");
      return;
    }
    if (!isDraftEditable) {
      setMessage("This application is already submitted.");
      return;
    }
    if (!validateEducationPanels()) return;

    try {
      setSaving(true);
      setMessage("");
      setValidationIssues([]);
      const basePayload = applicationPayload("Applied");
      const validation = await validateApplicationWithAi(basePayload);
      if (validation.mandatoryFailed) {
        setMessage("Mandatory validation failed. Please correct the highlighted issues and submit again.");
        return;
      }
      const payloadWithValidation = { ...basePayload, ...validation };
      const draft = applicationId ? { _id: applicationId } : await ep1.post("/admission-dynamic/applications-draft-save", {
        ...payloadWithValidation,
        applicationstatus: "Draft"
      }).then((r) => r.data);
      const res = await ep1.post("/admission-dynamic/applications-draft-submit", {
        ...payloadWithValidation,
        id: draft?._id || applicationId
      });
      const fee = await getApplicationFeeForApplication(res.data);
      const provisional = await getProvisionalFeeForApplication(res.data);
      setApplicationId(res.data?._id || "");
      setIsDraftEditable(false);
      setApplicationFee(fee);
      setProvisionalFee(provisional);
      const defaultGateway = paymentGateways.find((item) => item.default === "Yes") || paymentGateways[0];
      if (defaultGateway) setSelectedPaymentGatewayId(defaultGateway._id);
      setMessage(`Thank you. Your admission application has been submitted successfully. Application ID: ${res.data?._id || ""}`);
      setSubmittedApplication({
        ...(res.data || {}),
        ...validation,
        applicationfeeamount: Number(fee?.amount || 0),
        paymentstatus: fee ? "Pending" : "Not Required",
        provisionalfeeamount: Number(provisional?.amount || 0),
        provisionalpaymentstatus: provisional ? "Pending" : "Not Required"
      });
    } catch (err) {
      setMessage(err.response?.data?.msg || err.response?.data?.message || "Unable to submit the application. Please try again.");
    } finally {
      setSaving(false);
      setValidatingApplication(false);
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

  const tabLabels = useMemo(() => [
    "Basic Registration",
    "Applicant Details",
    ...groupedFields.map((pageGroup) => pageGroup.page),
    "Documents"
  ], [groupedFields]);

  const redTabStyles = {
    borderBottom: "1px solid #e5e7eb",
    mb: 3,
    "& .MuiTab-root": {
      alignItems: "center",
      color: "#555",
      fontWeight: 700,
      minHeight: 48,
      textTransform: "none"
    },
    "& .Mui-selected": { color: "#d32f2f !important" },
    "& .MuiTabs-indicator": { bgcolor: "#d32f2f", height: 3 }
  };

  const renderAckValue = (label, value) => (
    <Grid item xs={12} sm={6} md={4} key={label}>
      <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, p: 1, minHeight: 56, bgcolor: "#fff" }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>{value || "-"}</Typography>
      </Box>
    </Grid>
  );

  if (submittedApplication) {
    const application = submittedApplication;
    const commonDetails = [
      ["Application ID", application._id],
      ["Username", application.username],
      ["Academic Year", application.academicyear],
      ["Form ID", application.formid],
      ["Name", application.name],
      ["Email", application.email],
      ["Phone", application.phone],
      ["Address", application.address],
      ["Pin", application.pin],
      ["Country", application.country_form],
      ["State", application.state_form],
      ["District", application.district_form],
      ["Gender", application.gender],
      ["Category", application.category],
      ["EWS", application.ews],
      ["Physically Handicapped", application.ph],
      ["Minority", application.minority],
      ["Level", application.level],
      ["Program Type", application.programtype],
      ["Program Applied", application.programapplied],
      ["Program Code", application.programcode],
      ["Date of Birth", application.dateofbirth],
      ["Date of Application", application.dateofapplication],
      ["Age", application.age],
      ["Validation Status", application.validationstatus],
      ["Status", application.applicationstatus]
    ];
    const documents = application.documents || [];
    const photoDocument = documents.find((doc) => String(doc.documenttype || "").toLowerCase() === "photo" && doc.url);
    const dynamicDetails = fields
      .map((field) => [field.label, application.extraFields?.[field.fieldname]])
      .filter((item) => item[1] !== undefined && item[1] !== "");

    return (
      <Box sx={{ bgcolor: "#f5f7fb", minHeight: "100vh", py: 3 }}>
        <style>
          {`
            @media print {
              @page { size: A4 portrait; margin: 10mm; }
              body * { visibility: hidden; }
              #admission-acknowledgement, #admission-acknowledgement * { visibility: visible; }
              #admission-acknowledgement { position: absolute; left: 0; top: 0; width: 190mm; box-shadow: none !important; border: 0 !important; }
              .no-print { display: none !important; }
            }
          `}
        </style>
        <Stack className="no-print" direction="row" spacing={1} justifyContent="center" sx={{ mb: 2, flexWrap: "wrap" }}>
          <Button variant="contained" onClick={() => window.print()}>Print Acknowledgement</Button>
          <Button variant="outlined" onClick={() => window.print()}>Download PDF</Button>
          <Button variant="outlined" onClick={() => {
            setSubmittedApplication(null);
            setApplicationFee(null);
            setProvisionalFee(null);
            setSelectedPaymentGatewayId("");
            setForm(createInitialForm());
            setMessage("");
          }}>
            New Application
          </Button>
        </Stack>

        {(applicationFee || provisionalFee) && (
          <Paper className="no-print" sx={{ maxWidth: 760, mx: "auto", mb: 2, p: 2 }}>
            <Tabs value={activePaymentTab} onChange={(_, value) => setActivePaymentTab(value)} sx={{ mb: 2 }}>
              <Tab label="Application Fee" />
              <Tab label="Provisional Fee" />
            </Tabs>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
              <TextField
                select
                size="small"
                label="Payment Gateway"
                value={selectedPaymentGatewayId}
                onChange={(e) => setSelectedPaymentGatewayId(e.target.value)}
                sx={{ minWidth: 240, bgcolor: "#fff" }}
              >
                <MenuItem value="">
                  Easebuzz (existing configuration)
                </MenuItem>
                {paymentGateways.map((gateway) => (
                  <MenuItem key={gateway._id} value={gateway._id}>
                    {gateway.gatewayname} ({gateway.type})
                  </MenuItem>
                ))}
              </TextField>
              {activePaymentTab === 0 && (
                applicationFee ? (
                  <Button variant="contained" color="success" disabled={paymentLoading} onClick={() => makeAdmissionPayment("Application", application)}>
                    {paymentLoading ? "Processing..." : `Pay Application Fee Rs. ${Number(applicationFee.amount || 0).toLocaleString("en-IN")}`}
                  </Button>
                ) : (
                  <Alert severity="info" sx={{ flex: 1 }}>Application fee is not configured for this program.</Alert>
                )
              )}
              {activePaymentTab === 1 && (
                provisionalFee ? (
                  <Button variant="contained" color="success" disabled={paymentLoading} onClick={() => makeAdmissionPayment("Provisional", application)}>
                    {paymentLoading ? "Processing..." : `Pay Provisional Fee Rs. ${Number(provisionalFee.amount || 0).toLocaleString("en-IN")}`}
                  </Button>
                ) : (
                  <Alert severity="info" sx={{ flex: 1 }}>Provisional admission fee is not configured for this program.</Alert>
                )
              )}
            </Stack>
          </Paper>
        )}

        <Paper id="admission-acknowledgement" sx={{ maxWidth: "210mm", mx: "auto", p: 3, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={9}>
              <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #1f2937" }}>
                {institution?.logolink && (
                  <Box component="img" src={institution.logolink} alt="Institution logo" sx={{ maxHeight: 72, maxWidth: 150, objectFit: "contain" }} />
                )}
                <Typography variant="h6" fontWeight={900}>{institution?.institutionname || "Institution"}</Typography>
                <Typography variant="body2">{institution?.address || ""}</Typography>
                <Typography variant="subtitle1" fontWeight={900}>Admission Application Acknowledgement</Typography>
                <Typography variant="body2">{formDefinition?.title || "Admission Application"}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ height: 145, border: "2px dashed #64748b", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", p: 1 }}>
                {photoDocument ? (
                  <Box component="img" src={photoDocument.url} alt="Applicant" sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                ) : (
                  <Typography variant="caption" color="text.secondary">Paste recent passport size photo here</Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ bgcolor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 1, p: 1.25 }}>
                <Typography variant="body2"><b>Application ID:</b> {application._id}</Typography>
                <Typography variant="body2"><b>Submitted on:</b> {new Date(application.createdAt || Date.now()).toLocaleString("en-IN")}</Typography>
                <Typography variant="body2"><b>Application Fee:</b> {applicationFee ? `Rs. ${Number(applicationFee.amount || 0).toLocaleString("en-IN")}` : "Not required"}</Typography>
                <Typography variant="body2"><b>Payment Status:</b> {application.paymentstatus || "Not Required"} {application.paymentrefno ? `(${application.paymentrefno})` : ""}</Typography>
                <Typography variant="body2"><b>Provisional Fee:</b> {provisionalFee ? `Rs. ${Number(provisionalFee.amount || 0).toLocaleString("en-IN")}` : "Not required"}</Typography>
                <Typography variant="body2"><b>Provisional Payment Status:</b> {application.provisionalpaymentstatus || "Not Required"} {application.provisionalpaymentrefno ? `(${application.provisionalpaymentrefno})` : ""}</Typography>
              </Box>
            </Grid>

            {commonDetails.map(([label, value]) => renderAckValue(label, value))}
            {dynamicDetails.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={900} sx={{ mt: 1 }}>Additional Details</Typography>
              </Grid>
            )}
            {dynamicDetails.map(([label, value]) => renderAckValue(label, value))}

            {documents.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, overflow: "hidden" }}>
                  <Typography sx={{ bgcolor: "#e2e8f0", px: 1.25, py: 0.75, fontWeight: 800 }}>Uploaded Documents</Typography>
                  <Grid container sx={{ bgcolor: "#f8fafc", borderTop: "1px solid #cbd5e1" }}>
                    {["Document Type", "File", "Description"].map((heading) => (
                      <Grid item xs={4} key={heading} sx={{ px: 1.25, py: 0.75, borderRight: "1px solid #e5e7eb" }}>
                        <Typography variant="caption" fontWeight={900}>{heading}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                  {documents.map((doc, index) => (
                    <Grid container key={`${doc.key || doc.url || doc.filename}-${index}`} sx={{ borderTop: "1px solid #e5e7eb" }}>
                      <Grid item xs={4} sx={{ px: 1.25, py: 0.75 }}>
                        <Typography variant="body2">{doc.documenttype || "-"}</Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ px: 1.25, py: 0.75 }}>
                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{doc.originalname || doc.filename || "-"}</Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ px: 1.25, py: 0.75 }}>
                        <Typography variant="body2">{doc.description || "-"}</Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, p: 1.5, mt: 1 }}>
                <Typography variant="subtitle2" fontWeight={900}>Declaration</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  I hereby declare that the information submitted in this application is true and correct to the best of my knowledge. I understand that admission is subject to verification of documents, eligibility, seat availability, and the rules and regulations of the institution. If any information is found incorrect or incomplete, my application/admission may be cancelled by the institution.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{ height: 70, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.5 }}>
                <Typography variant="body2">Applicant Signature</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ height: 70, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.5 }}>
                <Typography variant="body2">Date</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ border: "2px solid #1f2937", borderRadius: 1, p: 1.5, mt: 1 }}>
                <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>For Office Use Only</Typography>
                {application.validationcomments && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" fontWeight={800}>AI Validation Comments</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line", color: "#111827" }}>
                      {application.validationcomments}
                    </Typography>
                  </Box>
                )}
                <Grid container spacing={2}>
                  {["Documents Checked By", "Eligibility Verified By", "Approved By", "Remarks"].map((label) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ height: 54, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.5 }}>
                        <Typography variant="body2">{label}</Typography>
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

  const customTabs = groupedFields.map((pageGroup) => ({
    label: pageGroup.page,
    page: pageGroup.page,
    sections: pageGroup.sections
  }));
  const documentsTabIndex = customTabs.length + 2;
  const selectedCustomTab = activeTab > 1 && activeTab < documentsTabIndex ? customTabs[activeTab - 2] : null;
  const showDocumentsTab = activeTab === documentsTabIndex;
  const selectedProgramDisplay = form.programapplied
    ? `${form.programapplied}${form.programcode ? ` (${form.programcode})` : ""}`
    : "";
  const selectedApplicantDisplay = String(form.name || "").trim();
  const validationIssuesByTab = validationIssues.reduce((acc, issue) => {
    const tab = issue.tab || "General";
    if (!acc[tab]) acc[tab] = [];
    acc[tab].push(issue);
    return acc;
  }, {});

  return (
    <Box sx={{ bgcolor: "#f6f7fb", minHeight: "100vh", py: { xs: 2, md: 4 } }}>
      <Grid container spacing={2} sx={{ maxWidth: 1160, mx: "auto", px: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ overflow: "hidden", borderRadius: 2, boxShadow: "0 14px 35px rgba(15, 23, 42, 0.12)" }}>
            <Box sx={{ bgcolor: "#d32f2f", color: "#fff", p: { xs: 2.25, md: 3.5 }, display: "flex", alignItems: "center", gap: 2 }}>
              <AppRegistrationIcon sx={{ fontSize: { xs: 36, md: 48 } }} />
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: 0 }}>ADMISSION FORM</Typography>
                <Typography variant="subtitle1">Complete the steps to submit your application</Typography>
              </Box>
              {institution?.logolink && (
                <Box component="img" src={institution.logolink} alt="Institution logo" sx={{ ml: "auto", maxHeight: 62, maxWidth: 120, objectFit: "contain", bgcolor: "#fff", borderRadius: 1, p: 0.75 }} />
              )}
            </Box>
            <Box sx={{ px: { xs: 2, md: 3 }, py: 1.5, textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>
              <Typography variant="h6" fontWeight={800}>{institution?.institutionname || "Admission Form"}</Typography>
              <Typography variant="body2" color="text.secondary">{institution?.address || ""}</Typography>
              <Typography variant="body2" color="text.secondary">{formDefinition?.title || "Admission Application"}{formDefinition?.description ? ` - ${formDefinition.description}` : ""}</Typography>
            </Box>
          </Paper>
        </Grid>

        {message && (
          <Grid item xs={12}>
            <Alert severity={message.startsWith("Thank you") ? "success" : "warning"}>{message}</Alert>
          </Grid>
        )}

        {validationSummary && (
          <Grid item xs={12}>
            <Alert severity={validationSummary.validationstatus === "Pass" ? "success" : "error"} sx={{ whiteSpace: "pre-line" }}>
              <Typography fontWeight={800}>AI Validation: {validationSummary.validationstatus}</Typography>
              <Typography variant="body2" component="div" sx={{ whiteSpace: "pre-line" }}>
                {validationSummary.validationcomments || validationSummary.summary || "Validation completed."}
              </Typography>
            </Alert>
          </Grid>
        )}

        {validationIssues.length > 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, borderColor: "#d32f2f", bgcolor: "#fff7f7" }}>
              <Typography variant="h6" fontWeight={900} color="#b71c1c" sx={{ mb: 1 }}>
                Submission blocked: please correct these validation issues
              </Typography>
              {Object.entries(validationIssuesByTab).map(([tab, issues]) => (
                <Box key={tab} sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={900}>{tab}</Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {issues.map((issue) => (
                      <Box key={issue.id} sx={{ pl: 1.5, borderLeft: "3px solid #d32f2f" }}>
                        <Typography variant="body2" fontWeight={800}>
                          {issue.field} ({issue.criteriaType})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{issue.comment}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Paper>
          </Grid>
        )}

        {showLoginPanel && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Login to Resume Application</Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={retrieveUsername}
                  onChange={(e) => setRetrieveUsername(e.target.value)}
                  sx={{ "& .MuiInputBase-root": { height: 56 } }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={retrievePassword}
                  onChange={(e) => setRetrievePassword(e.target.value)}
                  sx={{ "& .MuiInputBase-root": { height: 56 } }}
                />
                <Button variant="contained" disabled={saving} onClick={loadDraftApplication} sx={{ minWidth: 150, height: 56, bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" } }}>
                  Retrieve
                </Button>
              </Stack>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 3, mb: 1 }}>Forgot Password</Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
                <TextField
                  fullWidth
                  label="Forgot password email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  sx={{ "& .MuiInputBase-root": { height: 56 } }}
                />
                <Button variant="outlined" disabled={saving} onClick={sendForgotPassword} sx={{ minWidth: 170, height: 56 }}>
                  Forgot Password
                </Button>
              </Stack>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={redTabStyles}
            >
              {tabLabels.map((label, index) => (
                <Tab key={`${label}-${index}`} label={`${index + 1}. ${label}`} />
              ))}
            </Tabs>

            {(selectedProgramDisplay || selectedApplicantDisplay) && (
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: "#fff7f7", borderColor: "#ffcdd2" }}>
                <Grid container spacing={1}>
                  {selectedApplicantDisplay && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Applicant Name</Typography>
                      <Typography variant="subtitle1" fontWeight={900} color="#b71c1c">{selectedApplicantDisplay}</Typography>
                    </Grid>
                  )}
                  {selectedProgramDisplay && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Selected Program</Typography>
                      <Typography variant="subtitle1" fontWeight={900} color="#b71c1c">{selectedProgramDisplay}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}

            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="h6" fontWeight={900}>Basic Registration</Typography>
                    <Button variant="text" onClick={() => setShowLoginPanel((prev) => !prev)} sx={{ color: "#d32f2f", fontWeight: 800, alignSelf: { xs: "flex-start", md: "center" } }}>
                      Already applied? Click here to log in
                    </Button>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required label="Full Name (As per SSC/HSC)" value={form.name || ""} onChange={(event) => updateForm("name", event.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required label="Mobile Number" value={form.phone || ""} onChange={(event) => updateForm("phone", event.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required label="Email ID" value={form.email || ""} onChange={(event) => updateEmailAndUsername(event.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required type="password" label="Password" value={form.password || ""} onChange={(event) => updateForm("password", event.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required label="Username" value={form.email || ""} disabled />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => updateAcademicYear(e.target.value)}>
                    {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField select fullWidth required label="Level" value={form.level || ""} onChange={(e) => updateLevel(e.target.value)}>
                    {levelOptions.map((level) => <MenuItem key={level} value={level}>{level}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Select Program</Typography>
                    {!form.level && (
                      <Alert severity="info" sx={{ mb: 2 }}>Select a level to load the program list.</Alert>
                    )}
                    {form.level && groupedProgramOptions.length === 0 && (
                      <Alert severity="warning" sx={{ mb: 2 }}>No programs found for the selected academic year and level.</Alert>
                    )}
                    <RadioGroup value={form.programcode} onChange={(e) => selectGroupedProgram(e.target.value)} sx={{ mb: 2 }}>
                      <Grid container spacing={2}>
                        {groupedProgramOptions.map((group) => (
                          <Grid item xs={12} key={group.type}>
                            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mx: { xs: 0, md: 2 }, width: "auto" }}>
                              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>{group.type}</Typography>
                              <Stack spacing={0.5}>
                                {group.programs.map((program) => (
                                  <FormControlLabel
                                    key={`${group.type}-${program.programcode || program.label}`}
                                    value={program.programcode}
                                    control={<Radio />}
                                    label={program.label}
                                  />
                                ))}
                              </Stack>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Program Code" value={form.programcode} disabled />
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>Applicant Details</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Selected Level" value={form.level || ""} disabled />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Selected Program" value={form.programapplied || ""} disabled />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Program Code" value={form.programcode} disabled />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField select fullWidth label="Gender" value={form.gender} onChange={(e) => updateForm("gender", e.target.value)}>
                    {["Male", "Female"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField select fullWidth label="Category" value={form.category} onChange={(e) => updateForm("category", e.target.value)}>
                    {["General", "SC", "ST", "OBC"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                  </TextField>
                </Grid>
                {["ews", "ph", "minority"].map((field) => (
                  <Grid item xs={12} md={4} key={field}>
                    <TextField select fullWidth label={field === "ph" ? "Physically Handicapped" : field.toUpperCase()} value={form[field]} onChange={(e) => updateForm(field, e.target.value)}>
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </TextField>
                  </Grid>
                ))}
                <Grid item xs={12} md={4}>
                  <TextField fullWidth type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} value={form.dateofbirth || ""} onChange={(e) => updateDateField("dateofbirth", e.target.value)} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth type="date" label="Date of Application" InputLabelProps={{ shrink: true }} value={todayString()} disabled />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Age" value={form.age || ""} disabled />
                </Grid>

              </Grid>
            )}

            {selectedCustomTab && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>{selectedCustomTab.page}</Typography>
                <Stack spacing={3}>
                  {selectedCustomTab.sections.map((sectionGroup) => (
                    <Box key={`${selectedCustomTab.page}-${sectionGroup.section}`}>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>{sectionGroup.section}</Typography>
                      <Grid container spacing={2}>
                        {sectionGroup.fields.map((field) => field.type === "addresspanel" ? (
                          <React.Fragment key={field._id}>{renderAddressPanel(field.isrequired === "Yes")}</React.Fragment>
                        ) : educationPanelMap[field.type] ? (
                          <React.Fragment key={field._id}>{renderEducationPanel(field.type, field.isrequired === "Yes")}</React.Fragment>
                        ) : (
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
            )}

            {showDocumentsTab && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Documents</Typography>
                <Grid container spacing={2}>
                  {documentTypes.map((type) => {
                    const safeId = type.replace(/[^a-z0-9]/gi, "-");
                    const matchingDocs = (form.documents || []).filter((doc) => doc.documenttype === type);
                    return (
                      <Grid item xs={12} md={6} key={type}>
                        <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                          <Typography fontWeight={800} sx={{ mb: 1 }}>{type}</Typography>
                          <Stack spacing={1}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Description"
                              value={documentForms[type]?.description || ""}
                              onChange={(e) => setDocumentForms((prev) => ({
                                ...prev,
                                [type]: { ...(prev[type] || {}), description: e.target.value }
                              }))}
                            />
                            <Button fullWidth variant="outlined" component="label">
                              {documentForms[type]?.file ? documentForms[type].file.name : "Choose File"}
                              <input
                                id={`admission-document-file-${safeId}`}
                                type="file"
                                accept={type === "Photo" ? ".jpg,.jpeg,.png,image/jpeg,image/png" : undefined}
                                hidden
                                onChange={(e) => setDocumentForms((prev) => ({
                                  ...prev,
                                  [type]: { ...(prev[type] || {}), file: e.target.files?.[0] || null }
                                }))}
                              />
                            </Button>
                            <Button variant="contained" onClick={() => uploadDocument(type)} disabled={uploadingDocument}>
                              {uploadingDocument ? "Uploading..." : "Upload"}
                            </Button>
                            {matchingDocs.map((doc, index) => (
                              <Stack key={`${doc.key || doc.url || doc.filename}-${index}`} direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ borderTop: "1px solid #e5e7eb", pt: 1 }}>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="caption" fontWeight={800} sx={{ display: "block", wordBreak: "break-word" }}>{doc.originalname || doc.filename}</Typography>
                                  {doc.url && <Typography component="a" href={doc.url} target="_blank" rel="noreferrer" variant="caption" sx={{ display: "block", wordBreak: "break-all" }}>{doc.url}</Typography>}
                                </Box>
                                <IconButton size="small" color="error" onClick={() => removeUploadedDocument((form.documents || []).findIndex((item) => item === doc))}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            ))}
                          </Stack>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                disabled={activeTab === 0}
                onClick={() => setActiveTab((prev) => Math.max(prev - 1, 0))}
              >
                Previous
              </Button>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" onClick={saveCurrentTab} disabled={saving || !isDraftEditable}>
                  {saving ? "Saving..." : activeTab === 0 ? "Register & Continue" : "Save This Tab"}
                </Button>
                <Button
                  variant="outlined"
                  disabled={activeTab >= documentsTabIndex}
                  onClick={() => setActiveTab((prev) => Math.min(prev + 1, documentsTabIndex))}
                >
                  Next
                </Button>
                {showDocumentsTab && (
                  <Button variant="contained" size="large" onClick={submitApplication} disabled={saving || validatingApplication || !isDraftEditable} sx={{ bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" } }}>
                    {validatingApplication ? "Validating..." : saving ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
