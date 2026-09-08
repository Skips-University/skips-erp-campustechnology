import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ep1 from "../api/ep1";

const academicYears = ["2026-27", "2027-28", "2028-29"];
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
  tenthsubjectmarks: [{ ...blankSubject }],
  twelvesubjectmarks: [{ ...blankSubject }],
  documents: [],
  extraFields: {}
});

export default function PublicAdmissionApplyGroupedPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const colid = query.get("colid");
  const formid = query.get("formid") || "default";
  const levelFromQuery = query.get("level") || "";
  const [institution, setInstitution] = useState(null);
  const [formDefinition, setFormDefinition] = useState(null);
  const [fields, setFields] = useState([]);
  const [programTypes, setProgramTypes] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [programsByType, setProgramsByType] = useState({});
  const [form, setForm] = useState(createInitialForm());
  const [saving, setSaving] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [message, setMessage] = useState("");
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [applicationFee, setApplicationFee] = useState(null);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [selectedPaymentGatewayId, setSelectedPaymentGatewayId] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    documenttype: "Photo",
    description: "",
    file: null
  });
  const admissionLevel = levelFromQuery || formDefinition?.level || "";

  useEffect(() => {
    if (colid) {
      loadInstitution();
      loadFormDefinition();
      loadFields();
      loadPaymentGateways();
    }
  }, [colid, formid]);

  useEffect(() => {
    if (colid && form.academicyear) {
      loadProgramTypes(form.academicyear);
    }
  }, [colid, form.academicyear, admissionLevel]);

  useEffect(() => {
    if (colid && form.academicyear && programTypes.length) {
      loadProgramsByType(form.academicyear, programTypes);
    } else {
      setProgramsByType({});
      setPrograms([]);
    }
  }, [colid, form.academicyear, programTypes, admissionLevel]);

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

  const loadProgramTypes = async (year) => {
    const levelPart = admissionLevel ? `&level=${encodeURIComponent(admissionLevel)}` : "";
    const res = await ep1.get(`/admission-dynamic/program-types?colid=${colid}&year=${encodeURIComponent(year)}${levelPart}`);
    setProgramTypes(res.data || []);
  };

  const loadPrograms = async (year, type) => {
    const levelPart = admissionLevel ? `&level=${encodeURIComponent(admissionLevel)}` : "";
    const res = await ep1.get(`/admission-dynamic/programs?colid=${colid}&year=${encodeURIComponent(year)}&type=${encodeURIComponent(type)}${levelPart}`);
    setPrograms(res.data || []);
  };

  const loadProgramsByType = async (year, types) => {
    const levelPart = admissionLevel ? `&level=${encodeURIComponent(admissionLevel)}` : "";
    const responses = await Promise.all(types.map(async (type) => {
      const res = await ep1.get(`/admission-dynamic/programs?colid=${colid}&year=${encodeURIComponent(year)}&type=${encodeURIComponent(type)}${levelPart}`);
      return [type, res.data || []];
    }));
    const grouped = Object.fromEntries(responses);
    setProgramsByType(grouped);
    setPrograms(responses.flatMap(([, items]) => items));
  };

  const programOptions = useMemo(() => programs.map((program) => ({
    label: `${program.program || program.name || ""} (${program.programcode || ""})`,
    type: program.type || program.programtype || "",
    program: program.program || program.name || "",
    programcode: program.programcode || ""
  })), [programs]);
  const groupedProgramOptions = useMemo(() => Object.entries(programsByType).map(([type, items]) => ({
    type,
    programs: items.map((program) => ({
      label: `${program.program || program.name || ""} (${program.programcode || ""})`,
      type,
      program: program.program || program.name || "",
      programcode: program.programcode || ""
    }))
  })).filter((group) => group.programs.length), [programsByType]);
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
      programcode: ""
    }));
  };

  const updateProgramType = (type) => {
    setForm((prev) => ({
      ...prev,
      programtype: type,
      programapplied: "",
      programcode: ""
    }));
  };

  const selectGroupedProgram = (programcode) => {
    const selected = groupedProgramOptions.flatMap((group) => group.programs).find((program) => program.programcode === programcode);
    setForm((prev) => ({
      ...prev,
      programtype: selected?.type || "",
      programcode: selected?.programcode || "",
      programapplied: selected?.program || ""
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

  const makeApplicationPayment = async (application = submittedApplication) => {
    if (!application || !applicationFee) return;
    const selectedGateway = paymentGateways.find((item) => item._id === selectedPaymentGatewayId);
    try {
      setPaymentLoading(true);
      setMessage("");
      const applicationId = String(application._id || application.id || application.applicationid || "").trim();
      const regnoForPayment = applicationId || String(application.email || form.email || application.phone || form.phone || "").trim();
      const studentName = String(application.name || form.name || application.email || "Admission Applicant").trim();
      const programName = String(application.programapplied || application.program || application.programcode || "Admission").trim();
      const feeItem = "Application Fee";
      const feeAmount = Number(applicationFee.amount || applicationFee.feeamount || application.applicationfeeamount || 0);
      if (!colid || !studentName || !regnoForPayment || !feeItem || feeAmount <= 0) {
        setMessage("Unable to initiate payment. Application fee details are incomplete.");
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
        applicationid: applicationId,
        description: `Admission application fee for ${programName}`,
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

  const submitApplication = async () => {
    if (!form.academicyear || !form.programtype || !form.name || !form.email || !form.phone || !form.programcode) {
      setMessage("Please select year, type and program, and enter name, email and phone before submitting.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      const res = await ep1.post("/admission-dynamic/applications", {
        ...form,
        colid,
        formid,
        tenthsubjectmarks: form.tenthsubjectmarks.filter((row) => row.subject),
        twelvesubjectmarks: form.twelvesubjectmarks.filter((row) => row.subject)
      });
      const fee = await getApplicationFeeForApplication(res.data);
      setApplicationFee(fee);
      const defaultGateway = paymentGateways.find((item) => item.default === "Yes") || paymentGateways[0];
      if (defaultGateway) setSelectedPaymentGatewayId(defaultGateway._id);
      setMessage(`Thank you. Your admission application has been submitted successfully. Application ID: ${res.data?._id || ""}`);
      setSubmittedApplication({
        ...(res.data || {}),
        applicationfeeamount: Number(fee?.amount || 0),
        paymentstatus: fee ? "Pending" : "Not Required"
      });
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
    <Grid item xs={12} sm={6} md={4} key={label}>
      <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, p: 1, minHeight: 56, bgcolor: "#fff" }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>{value || "-"}</Typography>
      </Box>
    </Grid>
  );

  const renderSubjectAck = (title, rows = []) => (
    <Grid item xs={12}>
      <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, overflow: "hidden" }}>
        <Typography sx={{ bgcolor: "#e2e8f0", px: 1.25, py: 0.75, fontWeight: 800 }}>{title}</Typography>
        <Grid container>
          {(rows.length ? rows : [{ subject: "-", marks: "-" }]).map((row, index) => (
            <React.Fragment key={`${title}-${index}`}>
              <Grid item xs={8} sx={{ borderTop: "1px solid #e5e7eb", px: 1.25, py: 0.75 }}>
                <Typography variant="body2">{row.subject || "-"}</Typography>
              </Grid>
              <Grid item xs={4} sx={{ borderTop: "1px solid #e5e7eb", px: 1.25, py: 0.75, textAlign: "right" }}>
                <Typography variant="body2">{row.marks || "-"}</Typography>
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
      ["Program Type", application.programtype],
      ["Program Applied", application.programapplied],
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
        <Stack className="no-print" direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => window.print()}>Print Acknowledgement</Button>
          <Button variant="outlined" onClick={() => window.print()}>Download PDF</Button>
          {applicationFee && (
            <>
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
              <Button variant="contained" color="success" disabled={paymentLoading} onClick={() => makeApplicationPayment(application)}>
                {paymentLoading ? "Processing..." : `Pay Application Fee Rs. ${Number(applicationFee.amount || 0).toLocaleString("en-IN")}`}
              </Button>
            </>
          )}
          <Button variant="outlined" onClick={() => {
            setSubmittedApplication(null);
            setApplicationFee(null);
            setSelectedPaymentGatewayId("");
            setForm(createInitialForm());
            setMessage("");
          }}>
            New Application
          </Button>
        </Stack>

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
              </Box>
            </Grid>

            {commonDetails.map(([label, value]) => renderAckValue(label, value))}
            {dynamicDetails.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={900} sx={{ mt: 1 }}>Additional Details</Typography>
              </Grid>
            )}
            {dynamicDetails.map(([label, value]) => renderAckValue(label, value))}

            {renderSubjectAck("Tenth Subjects and Marks", application.tenthsubjectmarks || [])}
            {renderSubjectAck("Twelve Subjects and Marks", application.twelvesubjectmarks || [])}

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
                  {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Select Program</Typography>
                  <RadioGroup value={form.programcode} onChange={(e) => selectGroupedProgram(e.target.value)} sx={{ mb: 3 }}>
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
