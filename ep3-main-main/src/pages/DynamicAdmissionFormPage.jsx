import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import {
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PrintIcon from "@mui/icons-material/Print";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EditIcon from "@mui/icons-material/Edit";
import ep1 from "../api/ep1";
import global1 from "./global1";

const academicYears = ["2026-27", "2027-28", "2028-29"];
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

const initialForm = {
  academicyear: "2026-27",
  name: "",
  email: "",
  phone: "",
  address: "",
  pin: "",
  country_form: "",
  state_form: "",
  district_form: "",
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
  extraFields: {}
};

export default function DynamicAdmissionFormPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("default");
  const [qrPreview, setQrPreview] = useState(null);
  const [programTypes, setProgramTypes] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [copyMessage, setCopyMessage] = useState("");
  const [editingFieldId, setEditingFieldId] = useState("");
  const [editingFormId, setEditingFormId] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [fieldForm, setFieldForm] = useState({
    label: "",
    fieldname: "",
    page: "Page 1",
    section: "Additional Details",
    type: "text",
    options: "",
    isrequired: "No",
    order: 0
  });
  const [formBuilder, setFormBuilder] = useState({
    title: "",
    formid: "",
    level: "",
    description: "",
    isactive: "Yes"
  });

  useEffect(() => {
    loadForms();
    loadLevels();
  }, []);

  useEffect(() => {
    if (selectedFormId) loadFields(selectedFormId);
  }, [selectedFormId]);

  useEffect(() => {
    loadProgramTypes(form.academicyear);
  }, [form.academicyear]);

  useEffect(() => {
    if (form.academicyear && form.programtype) {
      loadPrograms(form.academicyear, form.programtype);
    } else {
      setPrograms([]);
    }
  }, [form.academicyear, form.programtype]);

  const loadForms = async () => {
    const res = await ep1.get(`/admission-dynamic/forms?colid=${global1.colid}`);
    const formList = res.data || [];
    setForms(formList);
    if (!formList.some((item) => item.formid === selectedFormId)) {
      setSelectedFormId(formList[0]?.formid || "default");
    }
  };

  const loadFields = async (formid = selectedFormId) => {
    const res = await ep1.get(`/admission-dynamic/fields?colid=${global1.colid}&formid=${encodeURIComponent(formid)}`);
    setFields(res.data || []);
  };

  const loadProgramTypes = async (year) => {
    if (!year) return setProgramTypes([]);
    const res = await ep1.get(`/admission-dynamic/program-types?colid=${global1.colid}&year=${encodeURIComponent(year)}`);
    setProgramTypes(res.data || []);
  };

  const loadLevels = async () => {
    const res = await ep1.get(`/admission-dynamic/program-levels?colid=${global1.colid}`);
    setLevelOptions(res.data || []);
  };

  const loadPrograms = async (year, type) => {
    const res = await ep1.get(`/admission-dynamic/programs?colid=${global1.colid}&year=${encodeURIComponent(year)}&type=${encodeURIComponent(type)}`);
    setPrograms(res.data || []);
  };

  const programOptions = useMemo(() => programs.map((program) => ({
    label: `${program.program || program.name || ""} (${program.programcode || ""})`,
    program: program.program || program.name || "",
    programcode: program.programcode || ""
  })), [programs]);

  const selectedForm = forms.find((item) => item.formid === selectedFormId);
  const selectedLevel = selectedForm?.level || "";
  const levelQuery = selectedLevel ? `&level=${encodeURIComponent(selectedLevel)}` : "";
  const publicAdmissionLink = `${window.location.origin}/admission-apply?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}${levelQuery}`;
  const groupedAdmissionLink = `${window.location.origin}/admission-apply-grouped?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}${levelQuery}`;
  const tabbedAdmissionLink = `${window.location.origin}/admission-apply-tabbed?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}${levelQuery}`;
  const tabbedProgramAdmissionLink = `${window.location.origin}/admission-apply-tabbed-program?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}${levelQuery}`;
  const tabbedProgramDraftAdmissionLink = `${window.location.origin}/admission-apply-tabbed-program-draft?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}${levelQuery}`;
  const continueDraftAdmissionLink = `${window.location.origin}/admission-apply-tabbed-program-draft?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}${levelQuery}`;
  const credentialDraftAdmissionLink = `${window.location.origin}/admission-apply-tabbed-program-credential-draft?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}${levelQuery}`;
  const credentialDraftRetrieveLink = `${window.location.origin}/admission-apply-tabbed-program-credential-draft?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}${levelQuery}`;
  const credentialDraftRedAdmissionLink = `${window.location.origin}/admission-apply-tabbed-program-credential-draft-red?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}${levelQuery}`;
  const credentialDraftRedRetrieveLink = `${window.location.origin}/admission-apply-tabbed-program-credential-draft-red?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}${levelQuery}`;
  const credentialDraftRedLevelAdmissionLink = `${window.location.origin}/admission-apply-tabbed-program-credential-draft-red-level?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}`;
  const credentialDraftRedLevelRetrieveLink = `${window.location.origin}/admission-apply-tabbed-program-credential-draft-red-level?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}`;
  const credentialDraftRedLevelAiAdmissionLink = `${window.location.origin}/admission-apply-tabbed-program-credential-draft-red-level-ai?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}`;
  const credentialDraftRedLevelAiRetrieveLink = `${window.location.origin}/admission-apply-tabbed-program-credential-draft-red-level-ai?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}`;
  const credentialDraftRedLevelAiPhAdmissionLink = `${window.location.origin}/admission-apply-tabbed-program-credential-draft-red-level-ai-ph?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}`;
  const credentialDraftRedLevelAiPhRetrieveLink = `${window.location.origin}/admission-apply-tabbed-program-credential-draft-red-level-ai-ph?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}`;
  const shortAiPhAdmissionLink = `${window.location.origin}/admission-ai-ph?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}`;
  const shortAiPhRetrieveLink = `${window.location.origin}/admission-ai-ph?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}`;
  const shortAiPhFormDocumentsAdmissionLink = `${window.location.origin}/admission-ai-ph-documents?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}`;
  const shortAiPhFormDocumentsRetrieveLink = `${window.location.origin}/admission-ai-ph-documents?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}`;
  const aiAgentDocumentsAdmissionLink = `${window.location.origin}/admission-ai-agent-documents?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}`;
  const aiAgentDocumentsRetrieveLink = `${window.location.origin}/admission-ai-agent-documents?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}`;
  const applicationLookupLink = `${window.location.origin}/admission-application-lookup?colid=${global1.colid}`;
  const subjectAdmissionLink = `${window.location.origin}/admission-apply-subjects?colid=${global1.colid}&formid=${encodeURIComponent(selectedFormId || "default")}${levelQuery}`;
  const shareLinks = [
    { label: "Original admission link", value: publicAdmissionLink },
    { label: "Grouped program admission link", value: groupedAdmissionLink },
    { label: "Tabbed grouped admission link", value: tabbedAdmissionLink },
    { label: "Tabbed program admission link", value: tabbedProgramAdmissionLink },
    { label: "Tabbed program admission link with save per tab", value: tabbedProgramDraftAdmissionLink },
    { label: "Retrieve application and continue editing link", value: continueDraftAdmissionLink },
    { label: "Credential draft admission link", value: credentialDraftAdmissionLink },
    { label: "Credential retrieve and continue link", value: credentialDraftRetrieveLink },
    { label: "Red tabbed credential admission link", value: credentialDraftRedAdmissionLink },
    { label: "Red tabbed retrieve and continue link", value: credentialDraftRedRetrieveLink },
    { label: "Red tabbed admission link with level selection", value: credentialDraftRedLevelAdmissionLink },
    { label: "Red tabbed level retrieve and continue link", value: credentialDraftRedLevelRetrieveLink },
    { label: "Red tabbed AI validation admission link", value: credentialDraftRedLevelAiAdmissionLink },
    { label: "Red tabbed AI validation retrieve and continue link", value: credentialDraftRedLevelAiRetrieveLink },
    { label: "Red tabbed AI validation admission link with Physically Handicapped", value: credentialDraftRedLevelAiPhAdmissionLink },
    { label: "Red tabbed AI validation retrieve link with Physically Handicapped", value: credentialDraftRedLevelAiPhRetrieveLink },
    { label: "Short AI PH admission link", value: shortAiPhAdmissionLink },
    { label: "Short AI PH retrieve link", value: shortAiPhRetrieveLink },
    { label: "Short AI PH admission link with form documents", value: shortAiPhFormDocumentsAdmissionLink },
    { label: "Short AI PH retrieve link with form documents", value: shortAiPhFormDocumentsRetrieveLink },
    { label: "AI agent admission link with form documents", value: aiAgentDocumentsAdmissionLink },
    { label: "AI agent retrieve link with form documents", value: aiAgentDocumentsRetrieveLink },
    { label: "Application print/payment lookup link", value: applicationLookupLink },
    { label: "Admission configuration link", value: subjectAdmissionLink }
  ];
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

  const updateExtra = (field, value) => {
    setForm((prev) => ({
      ...prev,
      extraFields: { ...(prev.extraFields || {}), [field]: value }
    }));
  };

  const useAddressPanelTemplate = () => {
    setEditingFieldId("");
    setFieldForm({
      label: "Address Panel",
      fieldname: "address_panel",
      page: fieldForm.page || "Page 1",
      section: fieldForm.section || "Address Details",
      type: "addresspanel",
      options: "",
      isrequired: "No",
      order: fieldForm.order || 0
    });
  };

  const applyEducationPanelTemplate = (level) => {
    const normalized = String(level || "").toLowerCase();
    setEditingFieldId("");
    setFieldForm({
      label: `${level} ${["UG", "PG"].includes(level) ? "University" : "Board"} Panel`,
      fieldname: `education_${normalized}_panel`,
      page: fieldForm.page || "Page 1",
      section: `${level} Details`,
      type: `educationpanel${normalized}`,
      options: "",
      isrequired: "No",
      order: fieldForm.order || 0
    });
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

  const saveField = async () => {
    if (!fieldForm.label) return alert("Enter field label");
    try {
      const payload = {
        ...fieldForm,
        colid: global1.colid,
        formid: selectedFormId
      };
      if (editingFieldId) {
        await ep1.post("/admission-dynamic/fields-update", {
          ...payload,
          id: editingFieldId
        });
      } else {
        await ep1.post("/admission-dynamic/fields", payload);
      }
      setFieldForm({ label: "", fieldname: "", page: "Page 1", section: "Additional Details", type: "text", options: "", isrequired: "No", order: 0 });
      setEditingFieldId("");
      loadFields();
    } catch (err) {
      alert(err.response?.data?.msg || "Error saving field");
    }
  };

  const editField = (row) => {
    setEditingFieldId(row._id);
    setFieldForm({
      label: row.label || "",
      fieldname: row.fieldname || "",
      page: row.page || "Page 1",
      section: row.section || "Additional Details",
      type: row.type || "text",
      options: (row.options || []).join(", "),
      isrequired: row.isrequired || "No",
      order: row.order || 0
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelFieldEdit = () => {
    setEditingFieldId("");
    setFieldForm({ label: "", fieldname: "", page: "Page 1", section: "Additional Details", type: "text", options: "", isrequired: "No", order: 0 });
  };

  const removeField = async (id) => {
    await ep1.post("/admission-dynamic/fields-delete", { id, colid: global1.colid, formid: selectedFormId });
    loadFields();
  };

  const downloadFieldTemplate = () => {
    const rows = [
      {
        label: "Father Name",
        fieldname: "father_name",
        page: "Page 1",
        section: "Family Details",
        type: "text",
        options: "",
        isrequired: "No",
        order: 1
      },
      {
        label: "Hostel Required",
        fieldname: "hostel_required",
        page: "Page 2",
        section: "Additional Details",
        type: "dropdown",
        options: "Yes, No",
        isrequired: "No",
        order: 2
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Custom Fields");
    XLSX.writeFile(workbook, "dynamic_admission_custom_fields.xlsx");
  };

  const handleBulkFieldUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rows.length) {
        setBulkMessage("No rows found in the Excel file.");
        return;
      }

      const items = rows.map((row, index) => ({
        rowNumber: index + 2,
        label: row.label || row.Label || row["Field Label"] || "",
        fieldname: row.fieldname || row.fieldName || row["Field Key"] || row["field key"] || "",
        page: row.page || row.Page || "Page 1",
        section: row.section || row.Section || "Additional Details",
        type: row.type || row.Type || "text",
        options: row.options || row.Options || "",
        isrequired: row.isrequired || row.required || row.Required || "No",
        isactive: row.isactive || row.active || row.Active || "Yes",
        order: row.order || row.Order || 0
      }));

      const res = await ep1.post("/admission-dynamic/fields-bulk", {
        colid: global1.colid,
        formid: selectedFormId,
        items
      });

      const errors = res.data?.errors || [];
      setBulkMessage(`${res.data?.saved || 0} fields uploaded${errors.length ? `, ${errors.length} rows skipped` : ""}.`);
      loadFields();
    } catch (err) {
      setBulkMessage(err.response?.data?.msg || "Unable to upload custom fields.");
    }
  };

  const saveFormDefinition = async () => {
    if (!formBuilder.title) return alert("Enter form title");
    try {
      const payload = {
        ...formBuilder,
        id: editingFormId,
        colid: global1.colid,
        user: global1.user
      };
      const res = await ep1.post(editingFormId ? "/admission-dynamic/forms-update" : "/admission-dynamic/forms", payload);
      setFormBuilder({ title: "", formid: "", level: "", description: "", isactive: "Yes" });
      setEditingFormId("");
      await loadForms();
      if (res.data?.formid) setSelectedFormId(res.data.formid);
    } catch (err) {
      alert(err.response?.data?.msg || "Error saving form");
    }
  };

  const editFormDefinition = (row) => {
    setEditingFormId(row._id);
    setSelectedFormId(row.formid);
    setFormBuilder({
      title: row.title || "",
      formid: row.formid || "",
      level: row.level || "",
      description: row.description || "",
      isactive: row.isactive || "Yes"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFormDefinition = () => {
    setEditingFormId("");
    setFormBuilder({ title: "", formid: "", level: "", description: "", isactive: "Yes" });
  };

  const removeFormDefinition = async (id) => {
    if (!window.confirm("Remove this admission form from active list?")) return;
    await ep1.post("/admission-dynamic/forms-delete", { id, colid: global1.colid });
    loadForms();
  };

  const copyPublicLink = async (link = publicAdmissionLink, label = "Admission link") => {
    try {
      await navigator.clipboard.writeText(link);
      setCopyMessage(`${label} copied`);
    } catch (err) {
      setCopyMessage("Copy failed. Please select and copy the link.");
    }
  };

  const generateQrCode = async (link, label) => {
    try {
      const dataUrl = await QRCode.toDataURL(link, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: "H"
      });
      setQrPreview({
        label,
        link,
        formName: selectedForm?.title || selectedFormId || "Admission Form",
        dataUrl
      });
      setCopyMessage(`${label} QR code generated`);
      return dataUrl;
    } catch (err) {
      setCopyMessage("Unable to generate QR code");
      return "";
    }
  };

  const printQrCode = async (link, label) => {
    const dataUrl = await generateQrCode(link, label);
    if (!dataUrl) return;
    const formName = selectedForm?.title || selectedFormId || "Admission Form";
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) {
      setCopyMessage("Popup blocked. Please allow popup to print QR code.");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${formName} - ${label}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #111827; }
            .page { max-width: 720px; margin: 0 auto; text-align: center; }
            h1 { font-size: 24px; margin: 0 0 8px; }
            h2 { font-size: 18px; margin: 0 0 24px; font-weight: 600; color: #374151; }
            img { width: 320px; height: 320px; margin: 12px auto 20px; display: block; }
            .link { overflow-wrap: anywhere; font-size: 13px; line-height: 1.5; border-top: 1px solid #d1d5db; padding-top: 16px; }
            @media print { body { padding: 24px; } }
          </style>
        </head>
        <body>
          <div class="page">
            <h1>${formName}</h1>
            <h2>${label}</h2>
            <img src="${dataUrl}" alt="QR Code" />
            <div class="link">${link}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function(){ window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const submitApplication = async () => {
    try {
      await ep1.post("/admission-dynamic/applications", {
        ...form,
        colid: global1.colid,
        formid: selectedFormId,
        user: global1.user,
        tenthsubjectmarks: form.tenthsubjectmarks.filter((row) => row.subject),
        twelvesubjectmarks: form.twelvesubjectmarks.filter((row) => row.subject)
      });
      alert("Application saved");
      setForm({ ...initialForm });
    } catch (err) {
      alert(err.response?.data?.msg || "Error saving application");
    }
  };

  const renderText = (field, label, props = {}) => (
    <Grid item xs={12} md={props.md || 4}>
      <TextField
        fullWidth
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

  return (
    <Grid container spacing={2} padding={2}>
      <Grid item xs={12}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>Dynamic Admission Form</Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Admission Forms</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Form Title" value={formBuilder.title} onChange={(e) => setFormBuilder({ ...formBuilder, title: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Form ID" value={formBuilder.formid} onChange={(e) => setFormBuilder({ ...formBuilder, formid: e.target.value })} helperText={editingFormId ? "Form ID cannot be changed while editing" : "Optional"} InputProps={{ readOnly: Boolean(editingFormId) }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Level" value={formBuilder.level} onChange={(e) => setFormBuilder({ ...formBuilder, level: e.target.value })}>
                {levelOptions.map((level) => <MenuItem key={level} value={level}>{level}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Description" value={formBuilder.description} onChange={(e) => setFormBuilder({ ...formBuilder, description: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Status" value={formBuilder.isactive} onChange={(e) => setFormBuilder({ ...formBuilder, isactive: e.target.value })}>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button fullWidth variant="contained" onClick={saveFormDefinition} sx={{ height: 56 }}>{editingFormId ? "Update" : "Add"}</Button>
            </Grid>
            {editingFormId && (
              <Grid item xs={12} md={1}>
                <Button fullWidth variant="outlined" onClick={resetFormDefinition} sx={{ height: 56 }}>Cancel</Button>
              </Grid>
            )}
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Current Form" value={selectedFormId} onChange={(e) => setSelectedFormId(e.target.value)}>
                {forms.map((item) => <MenuItem key={item.formid} value={item.formid}>{item.title} ({item.formid})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="body2" color="text.secondary" sx={{ pt: { md: 1.5 } }}>
                Custom fields and share link below are for: <b>{selectedForm?.title || selectedFormId}</b>
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ height: 250, mt: 2 }}>
            <DataGrid
              rows={forms}
              getRowId={(row) => row._id}
              columns={[
                { field: "title", headerName: "Form Title", flex: 1.3 },
                { field: "formid", headerName: "Form ID", flex: 1 },
                { field: "level", headerName: "Level", flex: 0.8 },
                { field: "description", headerName: "Description", flex: 1.5 },
                { field: "isactive", headerName: "Active", flex: 0.6 },
                {
                  field: "action",
                  headerName: "Action",
                  flex: 0.8,
                  renderCell: (p) => (
                    <Stack direction="row" spacing={1}>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => editFormDefinition(p.row)}>
                        Edit
                      </Button>
                      <Button size="small" color="error" disabled={p.row.formid === "default"} onClick={() => removeFormDefinition(p.row._id)}>
                        Remove
                      </Button>
                    </Stack>
                  )
                }
              ]}
              slots={{ toolbar: GridToolbar }}
            />
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Share Admission Form</Typography>
          {shareLinks.map((item) => (
            <Stack key={item.label} direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 1 }}>
              <TextField fullWidth label={item.label} value={item.value} InputProps={{ readOnly: true }} />
              <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={() => copyPublicLink(item.value, item.label)} sx={{ minWidth: 120, height: 56 }}>
                Copy
              </Button>
              <Button variant="outlined" onClick={() => generateQrCode(item.value, item.label)} sx={{ minWidth: 130, height: 56 }}>
                Generate QR
              </Button>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => printQrCode(item.value, item.label)} sx={{ minWidth: 120, height: 56 }}>
                Print QR
              </Button>
            </Stack>
          ))}
          {qrPreview && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2, textAlign: "center" }}>
              <Typography variant="h6" fontWeight={700}>{qrPreview.formName}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{qrPreview.label}</Typography>
              <Box component="img" src={qrPreview.dataUrl} alt="Admission form QR code" sx={{ width: 220, height: 220 }} />
              <Typography variant="caption" display="block" sx={{ mt: 1, wordBreak: "break-all" }}>{qrPreview.link}</Typography>
              <Button variant="contained" startIcon={<PrintIcon />} sx={{ mt: 2 }} onClick={() => printQrCode(qrPreview.link, qrPreview.label)}>
                Print This QR
              </Button>
            </Paper>
          )}
          {copyMessage && <Typography color="success.main" sx={{ mt: 1 }}>{copyMessage}</Typography>}
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 2 }}>
            <Typography variant="h6">Add Custom Field</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" onClick={useAddressPanelTemplate}>Add Address Panel</Button>
              <Button variant="outlined" onClick={() => applyEducationPanelTemplate("10th")}>Add 10th Panel</Button>
              <Button variant="outlined" onClick={() => applyEducationPanelTemplate("12th")}>Add 12th Panel</Button>
              <Button variant="outlined" onClick={() => applyEducationPanelTemplate("UG")}>Add UG Panel</Button>
              <Button variant="outlined" onClick={() => applyEducationPanelTemplate("PG")}>Add PG Panel</Button>
              <Button variant="outlined" onClick={downloadFieldTemplate}>Download Template</Button>
              <Button component="label" variant="contained" startIcon={<UploadFileIcon />}>
                Bulk Upload
                <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkFieldUpload} />
              </Button>
            </Stack>
          </Stack>
          {bulkMessage && <Typography color="primary" sx={{ mb: 2 }}>{bulkMessage}</Typography>}
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField fullWidth label="Label" value={fieldForm.label} onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Field Key" value={fieldForm.fieldname} onChange={(e) => setFieldForm({ ...fieldForm, fieldname: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Page" value={fieldForm.page} onChange={(e) => setFieldForm({ ...fieldForm, page: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Section" value={fieldForm.section} onChange={(e) => setFieldForm({ ...fieldForm, section: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Type" value={fieldForm.type} onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value })}>
                {["text", "number", "date", "dropdown", "textarea", "addresspanel", "educationpanel10th", "educationpanel12th", "educationpanelug", "educationpanelpg"].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Options comma separated" value={fieldForm.options} onChange={(e) => setFieldForm({ ...fieldForm, options: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Order" value={fieldForm.order} onChange={(e) => setFieldForm({ ...fieldForm, order: e.target.value })} /></Grid>
            <Grid item xs={6} md={1}>
              <TextField select fullWidth label="Required" value={fieldForm.isrequired} onChange={(e) => setFieldForm({ ...fieldForm, isrequired: e.target.value })}>
                <MenuItem value="No">No</MenuItem><MenuItem value="Yes">Yes</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={1}><Button fullWidth variant="contained" onClick={saveField} sx={{ height: 56 }}>{editingFieldId ? "Update" : "Add"}</Button></Grid>
            {editingFieldId && (
              <Grid item xs={6} md={1}><Button fullWidth variant="outlined" onClick={cancelFieldEdit} sx={{ height: 56 }}>Cancel</Button></Grid>
            )}
          </Grid>
          <Box sx={{ height: 260, mt: 2 }}>
            <DataGrid
              rows={fields}
              getRowId={(row) => row._id}
              columns={[
                { field: "label", headerName: "Label", flex: 1 },
                { field: "fieldname", headerName: "Field Key", flex: 1 },
                { field: "page", headerName: "Page", flex: 0.8 },
                { field: "section", headerName: "Section", flex: 1 },
                { field: "type", headerName: "Type", flex: 0.7 },
                { field: "order", headerName: "Order", flex: 0.5 },
                { field: "isrequired", headerName: "Required", flex: 0.7 },
                {
                  field: "action",
                  headerName: "Action",
                  flex: 1,
                  renderCell: (p) => (
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => editField(p.row)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => removeField(p.row._id)}>Remove</Button>
                    </Stack>
                  )
                }
              ]}
              slots={{ toolbar: GridToolbar }}
            />
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Application Entry</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => updateAcademicYear(e.target.value)}>
                {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Type" value={form.programtype} onChange={(e) => updateProgramType(e.target.value)}>
                {programTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Program applied"
                value={form.programcode}
                disabled={!form.programtype}
                onChange={(e) => {
                  const selected = programOptions.find((program) => program.programcode === e.target.value);
                  setForm((prev) => ({ ...prev, programcode: selected?.programcode || "", programapplied: selected?.program || "" }));
                }}
              >
                {programOptions.map((program) => <MenuItem key={program.programcode || program.label} value={program.programcode}>{program.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Program Code" value={form.programcode} disabled /></Grid>
            {renderText("name", "Name")}
            {renderText("email", "Email")}
            {renderText("phone", "Phone")}
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
                  <MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem>
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
            <Grid item xs={12}><Divider /></Grid>
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
              <Button variant="contained" onClick={submitApplication}>Save Application</Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}
