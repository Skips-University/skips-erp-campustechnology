import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const subjectFields = ["Major", "Minor", "AEC", "SEC", "VAC", "IDC", "MDC"];
const fields = ["name", "regno", "scholarnumber", "abcid", "password", "email", "phone", "regulation", "program", "programcode", "Mediumofinstruction", "specialization1", "specialization2", ...subjectFields, "academicyear", "admissionyear", "rollno", "gender", "category", "state", "city", "district", "pincode", "guardianname", "guardianmobile", "guardianemail", "photo", "semester", "section"];
const academicYears = ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28"];
const semesters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const staticDropdownOptions = {
  academicyear: academicYears,
  admissionyear: academicYears,
  gender: ["Male", "Female", "Not specified"],
  semester: semesters,
  category: ["General", "SC", "ST", "OBC"]
};
const labels = {
  name: "Name",
  regno: "Reg No",
  scholarnumber: "Scholar Number",
  abcid: "ABC ID",
  password: "Password",
  email: "Email",
  phone: "Phone",
  program: "Program",
  programcode: "Program Code",
  Mediumofinstruction: "Medium of Instruction",
  regulation: "Regulation",
  specialization1: "Specialization 1",
  specialization2: "Specialization 2",
  Major: "Major",
  Minor: "Minor",
  AEC: "AEC",
  SEC: "SEC",
  VAC: "VAC",
  IDC: "IDC",
  MDC: "MDC",
  academicyear: "Academic Year",
  admissionyear: "Admission Year",
  rollno: "Roll No",
  gender: "Gender",
  category: "Category",
  state: "State",
  city: "City",
  district: "District",
  pincode: "Pincode",
  guardianname: "Guardian Name",
  guardianmobile: "Guardian Mobile",
  guardianemail: "Guardian Email",
  photo: "Photo",
  semester: "Semester",
  section: "Section",
  department: "Department",
  institution: "Institution"
};
const viewFilterFields = ["academicyear", "program", "programcode", "Mediumofinstruction", "department", "semester", "section", "specialization1", "specialization2", "Major", "Minor", "IDC", "AEC", "SEC", "VAC", "name", "regno", "scholarnumber", "abcid", "email", "phone", "institution"];
const blankViewFilter = { field: "academicyear", value: "" };
const blankForm = { ...fields.reduce((acc, field) => ({ ...acc, [field]: staticDropdownOptions[field]?.[0] || "" }), {}), customFields: {} };
const normalizeKey = (key) => String(key || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const geminiModelOptions = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];
const regnoGenerationModes = [
  { value: "random", label: "Random alphanumeric" },
  { value: "academicYearMongo", label: "Academic year / MongoDB ID" }
];

const valueFromRow = (row, field) => {
  const aliases = {
    regno: ["regno", "reg no", "registration no", "registration number"],
    scholarnumber: ["scholarnumber", "scholar number", "scholar no"],
    abcid: ["abcid", "abc id", "abc"],
    password: ["password"],
    programcode: ["programcode", "program code"],
    Mediumofinstruction: ["Mediumofinstruction", "mediumofinstruction", "medium of instruction"],
    specialization1: ["specialization1", "specialization 1", "specialisation1", "specialisation 1"],
    specialization2: ["specialization2", "specialization 2", "specialisation2", "specialisation 2"],
    Major: ["major", "Major"],
    Minor: ["minor", "Minor"],
    AEC: ["aec", "AEC"],
    SEC: ["sec", "SEC"],
    VAC: ["vac", "VAC"],
    IDC: ["idc", "IDC"],
    MDC: ["mdc", "MDC", "mdcsub"],
    academicyear: ["academicyear", "academic year"],
    admissionyear: ["admissionyear", "admission year"],
    rollno: ["rollno", "roll no", "roll number"],
    gender: ["gender"],
    category: ["category"],
    state: ["state"],
    city: ["city"],
    district: ["district"],
    pincode: ["pincode", "pin code", "pin"],
    guardianname: ["guardianname", "guardian name"],
    guardianmobile: ["guardianmobile", "guardian mobile", "guardian phone"],
    guardianemail: ["guardianemail", "guardian email"],
    photo: ["photo", "photo link", "photolink"]
  };
  const normalized = Object.entries(row).reduce((acc, [key, value]) => {
    acc[normalizeKey(key)] = value;
    return acc;
  }, {});
  const keys = aliases[field] || [field];
  for (const key of keys) {
    const value = normalized[normalizeKey(key)];
    if (value !== undefined) return value;
  }
  return "";
};

export default function StudentDataUploadPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [programOptions, setProgramOptions] = useState([]);
  const [regulationOptions, setRegulationOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState({});
  const [customFields, setCustomFields] = useState([]);
  const [aiRules, setAiRules] = useState([{ field: "", rule: "" }]);
  const [aiProvider, setAiProvider] = useState("Gemini");
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
  const [ollamaConfigs, setOllamaConfigs] = useState([]);
  const [ollamaConfigId, setOllamaConfigId] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLength, setPasswordLength] = useState(10);
  const [bulkGeneratePasswords, setBulkGeneratePasswords] = useState(false);
  const [bulkPasswordLength, setBulkPasswordLength] = useState(10);
  const [autoScholarNumber, setAutoScholarNumber] = useState(true);
  const [autoRegno, setAutoRegno] = useState(false);
  const [regnoMode, setRegnoMode] = useState("random");
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewFilters, setViewFilters] = useState([{ ...blankViewFilter }]);
  const [bulkSubject, setBulkSubject] = useState({ oldMajor: "", newMajor: "", oldMinor: "", newMinor: "" });
  const [selectedSubjectUpdate, setSelectedSubjectUpdate] = useState({ Major: "", Minor: "", IDC: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadAcademicOptions();
    loadCustomFields();
    loadOllamaConfigurations();
    loadRows();
  }, []);

  const fieldChoices = useMemo(() => [
    ...fields.map((field) => ({ value: field, label: labels[field] || field, custom: false, fieldname: field })),
    ...customFields.map((field) => ({ value: `custom:${field.fieldname}`, label: field.label || field.fieldname, custom: true, fieldname: field.fieldname }))
  ], [customFields]);

  const getChoice = (value) => fieldChoices.find((item) => item.value === value);

  const loadCustomFields = async () => {
    try {
      const res = await ep1.get("/api/v2/user-custom-fields", { params: { colid: global1.colid } });
      setCustomFields((res.data || []).filter((item) => item.fieldname));
    } catch {
      setCustomFields([]);
    }
  };

  const loadOllamaConfigurations = async () => {
    try {
      const res = await ep1.get("/api/v2/ollama-configuration", { params: { colid: global1.colid } });
      const activeConfigs = (res.data || []).filter((item) => String(item.active || "").toLowerCase() === "yes");
      setOllamaConfigs(activeConfigs);
      const defaultConfig = activeConfigs.find((item) => String(item.default || "").toLowerCase() === "yes") || activeConfigs[0];
      if (defaultConfig) setOllamaConfigId((prev) => prev || defaultConfig._id);
    } catch {
      setOllamaConfigs([]);
    }
  };

  useEffect(() => {
    loadSubjectOptions();
  }, [form.programcode, form.program, form.regulation, form.academicyear]);

  const loadAcademicOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/regulationsubject/options", { params: { colid: global1.colid } });
      const programs = (res.data?.programs || [])
        .filter((item) => item.program || item.programcode)
        .sort((a, b) => `${a.program || ""} ${a.programcode || ""}`.localeCompare(`${b.program || ""} ${b.programcode || ""}`));
      setProgramOptions(programs);
      setRegulationOptions(res.data?.regulations || []);
    } catch (err) {
      setProgramOptions([]);
      setRegulationOptions([]);
    }
  };

  const loadSubjectOptions = async () => {
    if (!form.program && !form.programcode) {
      setSubjectOptions({});
      return;
    }
    if (!form.regulation) {
      setSubjectOptions({});
      return;
    }
    try {
      const res = await ep1.get("/api/v2/regulationsubject", {
        params: {
          colid: global1.colid,
          regulation: form.regulation,
          program: form.program,
          programcode: form.programcode,
          academicyear: form.academicyear,
          status: "Active"
        }
      });
      const grouped = {};
      subjectFields.forEach((type) => {
        grouped[type] = [];
      });
      (res.data?.data || []).forEach((item) => {
        if (!grouped[item.type]) grouped[item.type] = [];
        if (item.subject && !grouped[item.type].includes(item.subject)) grouped[item.type].push(item.subject);
      });
      Object.keys(grouped).forEach((key) => grouped[key].sort((a, b) => a.localeCompare(b)));
      setSubjectOptions(grouped);
    } catch (err) {
      setSubjectOptions({});
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/student-data-upload", { params: { colid: global1.colid } });
      setRows(res.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load student data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
    setError("");
    setAutoScholarNumber(true);
    setAutoRegno(false);
    setRegnoMode("random");
  };

  const fieldOptions = (field) => {
    if (field === "program") return programOptions.map((item) => `${item.program || item.name || ""} (${item.programcode || ""})`);
    if (field === "regulation") return regulationOptions.map((item) => item.regulation).filter(Boolean);
    if (field === "Major" || field === "Minor") return subjectOptions[field] || [];
    if (subjectFields.includes(field)) return subjectOptions[field] || [];
    return staticDropdownOptions[field] || [];
  };

  const fieldValue = (field) => {
    if (field === "program" && form.program) return `${form.program || ""} (${form.programcode || ""})`;
    return form[field] || "";
  };

  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "program") {
        const selected = programOptions.find((item) => `${item.program || item.name || ""} (${item.programcode || ""})` === value);
        next.program = selected?.program || selected?.name || "";
        next.programcode = selected?.programcode || "";
        subjectFields.forEach((subjectField) => {
          next[subjectField] = "";
        });
      }
      if (field === "regulation" || field === "academicyear") {
        subjectFields.forEach((subjectField) => {
          next[subjectField] = "";
        });
      }
      return next;
    });
  };

  const updateCustomField = (fieldname, value) => {
    setForm((prev) => ({
      ...prev,
      customFields: {
        ...(prev.customFields || {}),
        [fieldname]: value
      }
    }));
  };

  const rowDataForAi = (item) => ({
    ...item,
    customFields: item.customFields || {}
  });

  const applyAiRulesToItem = async (item) => {
    const activeRules = aiRules
      .map((rule) => ({ field: rule.field, rule: String(rule.rule || "").trim() }))
      .filter((rule) => rule.field && rule.rule);
    if (!activeRules.length) return item;
    let next = { ...item, customFields: { ...(item.customFields || {}) } };
    for (const rule of activeRules) {
      const choice = getChoice(rule.field);
      if (!choice) continue;
      const res = await ep1.post("/api/v2/student-data-upload-ai-field", {
        colid: global1.colid,
        field: choice.fieldname,
        label: choice.label,
        rule: rule.rule,
        provider: aiProvider,
        geminiModel,
        ollamaConfigId,
        rowData: rowDataForAi(next)
      });
      const value = res.data?.value || "";
      if (choice.custom) {
        next.customFields[choice.fieldname] = value;
      } else {
        next[choice.fieldname] = value;
      }
    }
    return next;
  };

  const generatePasswordValue = (length = passwordLength) => {
    const size = Math.max(6, Math.min(32, Number(length) || 10));
    const groups = [
      "ABCDEFGHJKLMNPQRSTUVWXYZ",
      "abcdefghijkmnopqrstuvwxyz",
      "23456789",
      "!@#$%&*"
    ];
    const chars = groups.join("");
    const next = groups.map((group) => group[Math.floor(Math.random() * group.length)]);
    const randomIndex = (max) => {
      if (window.crypto?.getRandomValues) {
        const values = new Uint32Array(1);
        window.crypto.getRandomValues(values);
        return values[0] % max;
      }
      return Math.floor(Math.random() * max);
    };
    while (next.length < size) next.push(chars[randomIndex(chars.length)]);
    for (let index = next.length - 1; index > 0; index -= 1) {
      const swapIndex = randomIndex(index + 1);
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    }
    return next.join("");
  };

  const generatePassword = (length = passwordLength) => {
    updateField("password", generatePasswordValue(length));
  };

  const randomIndex = (max) => {
    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0] % max;
    }
    return Math.floor(Math.random() * max);
  };

  const generateRandomRegnoValue = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 10 }, () => chars[randomIndex(chars.length)]).join("");
  };

  const generateMongoLikeId = () => {
    const chars = "0123456789abcdef";
    return Array.from({ length: 24 }, () => chars[randomIndex(chars.length)]).join("");
  };

  const generateRegnoValue = () => (
    regnoMode === "academicYearMongo"
      ? `${form.academicyear || "NA"}/${generateMongoLikeId()}`
      : generateRandomRegnoValue()
  );

  const generateRegno = () => {
    updateField("regno", generateRegnoValue());
    setAutoRegno(false);
  };

  const regnoHelperText = autoRegno
    ? (regnoMode === "academicYearMongo" ? "Will be generated as Academic Year/MongoDB ID on save" : "Will be generated as random alphanumeric on save")
    : "";

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setPhotoUploading(true);
      setError("");
      const data = new FormData();
      data.append("photo", file);
      data.append("colid", global1.colid);
      data.append("user", global1.user);
      const res = await ep1.post("/api/v2/student-data-upload-photo", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      updateField("photo", res.data?.url || "");
      setMessage("Photo uploaded");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  const saveStudent = async () => {
    try {
      setError("");
      setMessage("");
      setAiGenerating(true);
      const withScholarNumber = autoScholarNumber ? { ...form, scholarnumber: "", autogeneratescholarnumber: "Yes" } : { ...form, autogeneratescholarnumber: "No" };
      const baseForm = autoRegno
        ? { ...withScholarNumber, regno: "", autogenerateregno: "Yes", regnogenerationmode: regnoMode }
        : { ...withScholarNumber, autogenerateregno: "No", regnogenerationmode: regnoMode };
      const aiResult = await applyAiRulesToItem(baseForm);
      const aiForm = {
        ...aiResult,
        autogeneratescholarnumber: autoScholarNumber ? "Yes" : "No",
        autogenerateregno: autoRegno ? "Yes" : "No",
        regnogenerationmode: regnoMode,
        ...(autoScholarNumber ? { scholarnumber: "" } : {}),
        ...(autoRegno ? { regno: "" } : {})
      };
      if (!aiForm.email) {
        setError("Email is required");
        return;
      }
      const payload = { ...aiForm, colid: global1.colid, user: global1.user, institution: global1.insname };
      if (editingId) {
        await ep1.post("/api/v2/student-data-upload-update", { ...payload, id: editingId });
        setMessage("Student updated");
      } else {
        await ep1.post("/api/v2/student-data-upload", payload);
        setMessage("Student added");
      }
      resetForm();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save student");
    } finally {
      setAiGenerating(false);
    }
  };

  const editRow = (row) => {
    const next = {};
    fields.forEach((field) => {
      next[field] = row[field] ?? "";
    });
    next.customFields = row.customFields || {};
    next.major = row.major || row.Major || "";
    next.minor = row.minor || row.Minor || "";
    next.Major = row.Major || row.major || "";
    next.Minor = row.Minor || row.minor || "";
    next.AEC = row.AEC || row.aec || "";
    next.SEC = row.SEC || row.sec || "";
    next.VAC = row.VAC || row.vac || "";
    next.IDC = row.IDC || row.idc || "";
    next.MDC = row.MDC || row.mdc || row.mdcsub || "";
    setForm(next);
    setAutoScholarNumber(false);
    setAutoRegno(false);
    setEditingId(row._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      setError("");
      setMessage("");
      await ep1.post("/api/v2/student-data-upload-delete", { id: row._id, colid: global1.colid });
      setMessage("Student deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete student");
    }
  };

  const bulkDeleteRows = async () => {
    if (!selectedIds.length) {
      setError("Select at least one student to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} selected student(s)?`)) return;
    try {
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/student-data-upload-bulk-delete", {
        ids: selectedIds,
        colid: global1.colid
      });
      setMessage(`Bulk delete completed. Deleted: ${res.data?.deleted || 0}`);
      setSelectedIds([]);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to bulk delete students");
    }
  };

  const existingSubjectOptions = (field) => {
    const values = rows.map((row) => row[field] || row[field.toLowerCase()] || "").filter(Boolean);
    return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));
  };

  const rowValue = (row, field) => {
    if (String(field).startsWith("custom:")) {
      const key = String(field).replace("custom:", "");
      return row.customFields?.[key] || "";
    }
    if (field === "Major") return row.Major || row.major || "";
    if (field === "Minor") return row.Minor || row.minor || "";
    if (field === "AEC") return row.AEC || row.aec || "";
    if (field === "SEC") return row.SEC || row.sec || "";
    if (field === "VAC") return row.VAC || row.vac || "";
    if (field === "IDC") return row.IDC || row.idc || "";
    return row[field] || "";
  };

  const allViewFilterFields = useMemo(() => [
    ...viewFilterFields,
    ...customFields.map((field) => `custom:${field.fieldname}`)
  ], [customFields]);

  const labelForField = (field) => {
    if (String(field).startsWith("custom:")) {
      const key = String(field).replace("custom:", "");
      const custom = customFields.find((item) => item.fieldname === key);
      return custom?.label || key;
    }
    return labels[field] || field;
  };

  const viewFilterOptions = (field) => {
    const values = rows.map((row) => String(rowValue(row, field) || "").trim()).filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  };

  const updateViewFilter = (index, patch) => {
    setViewFilters((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item)));
  };

  const addViewFilter = () => setViewFilters((prev) => [...prev, { ...blankViewFilter }]);
  const removeViewFilter = (index) => setViewFilters((prev) => (prev.length === 1 ? [{ ...blankViewFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)));
  const clearViewFilters = () => setViewFilters([{ ...blankViewFilter }]);

  const filteredRows = useMemo(() => {
    const activeFilters = viewFilters
      .map((filter) => ({ field: filter.field, value: String(filter.value || "").trim().toLowerCase() }))
      .filter((filter) => filter.field && filter.value);
    if (!activeFilters.length) return rows;
    return rows.filter((row) =>
      activeFilters.every((filter) => String(rowValue(row, filter.field) || "").toLowerCase().includes(filter.value))
    );
  }, [rows, viewFilters]);

  const bulkUpdateSubject = async (field) => {
    const oldKey = field === "Major" ? "oldMajor" : "oldMinor";
    const newKey = field === "Major" ? "newMajor" : "newMinor";
    const oldValue = bulkSubject[oldKey];
    const newValue = bulkSubject[newKey];
    if (!oldValue || !newValue) {
      setError(`Select old ${field} and enter new ${field}`);
      return;
    }
    if (!window.confirm(`Update all ${field} values from "${oldValue}" to "${newValue}" for this institution?`)) return;
    try {
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/student-data-upload-bulk-subject-update", {
        colid: global1.colid,
        field,
        oldValue,
        newValue
      });
      setMessage(`${field} updated. Matched: ${res.data?.matched || 0}, Modified: ${res.data?.modified || 0}`);
      setBulkSubject((prev) => ({ ...prev, [oldKey]: "", [newKey]: "" }));
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || `Unable to update ${field}`);
    }
  };

  const bulkUpdateSelectedSubjects = async () => {
    if (!selectedIds.length) {
      setError("Select at least one student");
      return;
    }
    if (!selectedSubjectUpdate.Major && !selectedSubjectUpdate.Minor && !selectedSubjectUpdate.IDC) {
      setError("Enter Major, Minor or IDC to update");
      return;
    }
    if (!window.confirm(`Update Major/Minor/IDC for ${selectedIds.length} selected student(s)?`)) return;
    try {
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/student-data-upload-selected-subject-update", {
        colid: global1.colid,
        ids: selectedIds,
        ...selectedSubjectUpdate
      });
      setMessage(`Selected students updated. Matched: ${res.data?.matched || 0}, Modified: ${res.data?.modified || 0}`);
      setSelectedSubjectUpdate({ Major: "", Minor: "", IDC: "" });
      setSelectedIds([]);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to update selected students");
    }
  };

  const downloadTemplate = () => {
    const template = fields.reduce((acc, field) => ({ ...acc, [labels[field]]: "" }), {});
    customFields.forEach((field) => {
      template[field.label || field.fieldname] = "";
    });
    const worksheet = XLSX.utils.json_to_sheet([template]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "student_data_upload_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (bulkUploading) return;
    try {
      setBulkUploading(true);
      setError("");
      setMessage("");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!excelRows.length) {
        setError("No rows found in the Excel file");
        return;
      }
      setAiGenerating(true);
      const items = [];
      for (let index = 0; index < excelRows.length; index += 1) {
        const row = excelRows[index];
        const item = { rowNumber: index + 2 };
        fields.forEach((field) => {
          item[field] = valueFromRow(row, field);
        });
        if (bulkGeneratePasswords) item.password = generatePasswordValue(bulkPasswordLength);
        if (!item.password) item.password = "";
        item.customFields = {};
        customFields.forEach((field) => {
          item.customFields[field.fieldname] = valueFromRow(row, field.fieldname) || valueFromRow(row, field.label);
        });
        items.push(await applyAiRulesToItem(item));
      }
      const res = await ep1.post("/api/v2/student-data-upload-bulk", {
        colid: global1.colid,
        user: global1.user,
        institution: global1.insname,
        generateRandomPassword: bulkGeneratePasswords ? "Yes" : "No",
        passwordLength: bulkPasswordLength,
        items
      });
      const errors = res.data?.errors || [];
      setMessage(`Bulk upload completed. Saved: ${res.data?.saved || 0}${errors.length ? `, Errors: ${errors.length}` : ""}`);
      setError(errors.length ? errors.slice(0, 5).map((item) => `Row ${item.rowNumber}: ${item.msg}`).join(" | ") : "");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload Excel file");
    } finally {
      setBulkUploading(false);
      setAiGenerating(false);
    }
  };

  const columns = useMemo(() => [
    ...fields.map((field) => ({
      field,
      headerName: labels[field],
      width: field === "email" || field === "photo" ? 220 : field === "program" ? 190 : field === "academicyear" || field === "admissionyear" ? 150 : 140
    })),
    ...customFields.map((field) => ({
      field: `custom_${field.fieldname}`,
      headerName: field.label || field.fieldname,
      width: 160,
      valueGetter: (params) => params.row.customFields?.[field.fieldname] || ""
    })),
    { field: "user", headerName: "User", width: 160 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 140,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editRow(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    }
  ], [customFields]);

  return (
    <MenuPageShell title="Student Data Upload">
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Student Data Upload</Typography>
          <Typography variant="body2" color="text.secondary">Maintain student records with limited fields. Required hidden user fields are auto-filled.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadRows}>Refresh</Button>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadTemplate}>Template</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={bulkDeleteRows} disabled={!selectedIds.length}>
            Delete Selected ({selectedIds.length})
          </Button>
          <Button variant="contained" component="label" startIcon={<UploadFileIcon />} disabled={bulkUploading}>
            {bulkUploading ? "Uploading..." : "Bulk Upload"}
            <input type="file" accept=".xlsx,.xls" hidden onChange={handleBulkUpload} disabled={bulkUploading} />
          </Button>
        </Stack>
      </Stack>

      {bulkUploading && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
            <Typography fontWeight={700}>Uploading student data...</Typography>
            <Typography variant="body2" color="text.secondary">Please wait while the Excel file is processed.</Typography>
          </Stack>
          <LinearProgress />
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
          <FormControlLabel
            control={<Checkbox checked={bulkGeneratePasswords} onChange={(event) => setBulkGeneratePasswords(event.target.checked)} />}
            label="Generate random password for bulk upload"
          />
          <TextField
            type="number"
            label="Bulk password length"
            value={bulkPasswordLength}
            inputProps={{ min: 6, max: 32 }}
            onChange={(event) => setBulkPasswordLength(event.target.value)}
            disabled={!bulkGeneratePasswords}
            sx={{ width: { xs: "100%", md: 220 } }}
          />
          <Typography variant="body2" color="text.secondary">
            When selected, generated passwords override the password column during Excel upload.
          </Typography>
        </Stack>
      </Paper>

      {aiGenerating && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
            <Typography fontWeight={700}>Applying {aiProvider} field rules...</Typography>
            <Typography variant="body2" color="text.secondary">Fields without rules will keep their direct values.</Typography>
          </Stack>
          <LinearProgress />
        </Paper>
      )}

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">Optional AI Field Rules</Typography>
            <Typography variant="body2" color="text.secondary">
              Select any standard or custom field and describe how AI should generate it from the current row data. Leave empty to use direct values.
            </Typography>
          </Box>
          <Button startIcon={<AddIcon />} onClick={() => setAiRules((prev) => [...prev, { field: "", rule: "" }])}>Add Rule</Button>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="AI Provider" value={aiProvider} onChange={(event) => setAiProvider(event.target.value)}>
              <MenuItem value="Gemini">Gemini</MenuItem>
              <MenuItem value="Ollama">Ollama</MenuItem>
            </TextField>
          </Grid>
          {aiProvider === "Gemini" && (
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Gemini Model" value={geminiModel} onChange={(event) => setGeminiModel(event.target.value)}>
                {geminiModelOptions.map((model) => <MenuItem key={model} value={model}>{model}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {aiProvider === "Ollama" && (
            <Grid item xs={12} md={5}>
              <TextField
                select
                fullWidth
                label="Ollama Configuration"
                value={ollamaConfigId}
                onChange={(event) => setOllamaConfigId(event.target.value)}
                helperText={ollamaConfigs.length ? "Selected model/server will be used for field generation." : "No active Ollama configuration found."}
              >
                {ollamaConfigs.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.name} - {item.modelname} ({item.serveraddress || "http://localhost:11434"})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
          {aiRules.map((rule, index) => (
            <React.Fragment key={`ai-rule-${index}`}>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Field" value={rule.field} onChange={(event) => setAiRules((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, field: event.target.value } : item))}>
                  <MenuItem value="">No AI rule</MenuItem>
                  {fieldChoices.map((choice) => <MenuItem key={choice.value} value={choice.value}>{choice.label}{choice.custom ? " (Custom)" : ""}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Rule"
                  placeholder="Example: Create roll number as academic year last two digits + program code + 3 digit serial from roll no."
                  value={rule.rule}
                  onChange={(event) => setAiRules((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, rule: event.target.value } : item))}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <IconButton color="error" onClick={() => setAiRules((prev) => prev.length === 1 ? [{ field: "", rule: "" }] : prev.filter((_, itemIndex) => itemIndex !== index))} sx={{ height: 56, width: 56 }}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6">{editingId ? "Edit Student" : "Add Student"}</Typography>
          <Typography variant="body2" color="text.secondary">Records loaded: {rows.length}</Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#f8fafc" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={<Checkbox checked={autoRegno} onChange={(event) => setAutoRegno(event.target.checked)} />}
                    label="Auto-generate regno"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">Regno generation style</Typography>
                    <RadioGroup
                      row
                      value={regnoMode}
                      onChange={(event) => setRegnoMode(event.target.value)}
                    >
                      {regnoGenerationModes.map((mode) => (
                        <FormControlLabel key={mode.value} value={mode.value} control={<Radio size="small" />} label={mode.label} />
                      ))}
                    </RadioGroup>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth variant="outlined" sx={{ height: 56 }} onClick={generateRegno}>
                    Generate Regno
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={<Checkbox checked={autoScholarNumber} onChange={(event) => setAutoScholarNumber(event.target.checked)} />}
                    label="Auto-generate scholar number"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Password length"
                    value={passwordLength}
                    inputProps={{ min: 6, max: 32 }}
                    onChange={(event) => setPasswordLength(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button fullWidth variant="outlined" sx={{ height: 56 }} onClick={() => generatePassword()}>
                    Generate Password
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          {fields.map((field) => (
            <Grid item xs={12} sm={6} md={3} key={field}>
              {field === "program" ? (
                <Autocomplete
                  options={programOptions}
                  value={programOptions.find((item) => item.programcode === form.programcode) || null}
                  onChange={(_, value) => updateField("program", value ? `${value.program || value.name || ""} (${value.programcode || ""})` : "")}
                  getOptionLabel={(option) => option ? `${option.program || option.name || ""}${option.programcode ? ` (${option.programcode})` : ""}` : ""}
                  isOptionEqualToValue={(option, value) => option.programcode === value.programcode}
                  renderInput={(params) => <TextField {...params} fullWidth label={labels[field]} />}
                />
              ) : subjectFields.includes(field) ? (
                <Autocomplete
                  freeSolo
                  options={fieldOptions(field)}
                  value={fieldValue(field)}
                  onInputChange={(_, value) => updateField(field, value)}
                  onChange={(_, value) => updateField(field, value || "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label={labels[field]}
                      helperText={form.regulation && (form.program || form.programcode) ? "Loaded from regulation subjects; custom value allowed" : "Select regulation and program to load suggestions; custom value allowed"}
                    />
                  )}
                />
              ) : (
                <TextField
                  fullWidth
                  select={fieldOptions(field).length > 0 && field !== "programcode"}
                  disabled={field === "programcode" || (field === "scholarnumber" && autoScholarNumber) || (field === "regno" && autoRegno)}
                  required={field === "email"}
                  label={labels[field]}
                  value={(field === "scholarnumber" && autoScholarNumber) || (field === "regno" && autoRegno) ? "" : fieldValue(field)}
                  onChange={(event) => updateField(field, event.target.value)}
                  helperText={field === "scholarnumber" && autoScholarNumber ? "Will be generated on save" : (field === "regno" ? regnoHelperText : "")}
                >
                  {fieldOptions(field).map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              )}
            </Grid>
          ))}
          {customFields.map((field) => (
            <Grid item xs={12} sm={6} md={3} key={`custom-${field.fieldname}`}>
              <TextField
                fullWidth
                label={field.label || field.fieldname}
                value={form.customFields?.[field.fieldname] || ""}
                onChange={(event) => updateCustomField(field.fieldname, event.target.value)}
                required={field.isrequired === "Yes"}
                helperText="Custom field"
              />
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ height: 56 }} disabled={photoUploading}>
              {photoUploading ? "Uploading..." : "Upload Photo"}
              <input type="file" accept=".jpg,.jpeg,.png" hidden onChange={uploadPhoto} />
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={saveStudent}>{editingId ? "Update" : "Save"}</Button>
              <Button variant="outlined" onClick={resetForm}>{editingId ? "Cancel Edit" : "Clear"}</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Bulk Update Major / Minor</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Old Major" value={bulkSubject.oldMajor} onChange={(event) => setBulkSubject({ ...bulkSubject, oldMajor: event.target.value })}>
              {existingSubjectOptions("Major").map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="New Major" value={bulkSubject.newMajor} onChange={(event) => setBulkSubject({ ...bulkSubject, newMajor: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" sx={{ height: 56 }} onClick={() => bulkUpdateSubject("Major")}>Update Major</Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Old Minor" value={bulkSubject.oldMinor} onChange={(event) => setBulkSubject({ ...bulkSubject, oldMinor: event.target.value })}>
              {existingSubjectOptions("Minor").map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="New Minor" value={bulkSubject.newMinor} onChange={(event) => setBulkSubject({ ...bulkSubject, newMinor: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" sx={{ height: 56 }} onClick={() => bulkUpdateSubject("Minor")}>Update Minor</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">Update Selected Students</Typography>
            <Typography variant="body2" color="text.secondary">Select students in the grid, then update Major, Minor and IDC together.</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">Selected: {selectedIds.length}</Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Major" value={selectedSubjectUpdate.Major} onChange={(event) => setSelectedSubjectUpdate((prev) => ({ ...prev, Major: event.target.value }))} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Minor" value={selectedSubjectUpdate.Minor} onChange={(event) => setSelectedSubjectUpdate((prev) => ({ ...prev, Minor: event.target.value }))} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="IDC" value={selectedSubjectUpdate.IDC} onChange={(event) => setSelectedSubjectUpdate((prev) => ({ ...prev, IDC: event.target.value }))} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="contained" sx={{ height: 56 }} onClick={bulkUpdateSelectedSubjects} disabled={!selectedIds.length}>
              Update Selected
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">View Filters</Typography>
            <Typography variant="body2" color="text.secondary">Dynamically filter the grid by academic, subject, contact, and institution fields.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<AddIcon />} onClick={addViewFilter}>Add Filter</Button>
            <Button variant="outlined" onClick={clearViewFilters}>Clear</Button>
          </Stack>
        </Stack>
        <Grid container spacing={2}>
          {viewFilters.map((filter, index) => (
            <React.Fragment key={`${filter.field}-${index}`}>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth label="Field" value={filter.field} onChange={(event) => updateViewFilter(index, { field: event.target.value })}>
                  {allViewFilterFields.map((field) => <MenuItem key={field} value={field}>{labelForField(field)}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={7}>
                <Autocomplete
                  freeSolo
                  options={viewFilterOptions(filter.field)}
                  value={filter.value || ""}
                  onInputChange={(_, value) => updateViewFilter(index, { value })}
                  onChange={(_, value) => updateViewFilter(index, { value: value || "" })}
                  renderInput={(params) => <TextField {...params} label={labelForField(filter.field)} />}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <IconButton color="error" onClick={() => removeViewFilter(index)} disabled={viewFilters.length === 1} sx={{ height: 56, width: 56 }}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={filteredRows.map((row) => ({ ...row, id: row._id, major: row.major || row.Major || "", minor: row.minor || row.Minor || "", MDC: row.MDC || row.mdc || row.mdcsub || "" }))}
          columns={columns}
          loading={loading}
          checkboxSelection
          rowSelectionModel={selectedIds}
          onRowSelectionModelChange={(selection) => setSelectedIds(Array.from(selection))}
          disableRowSelectionOnClick
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_data_upload" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1750 }}
        />
      </Paper>
    </Box>
    </MenuPageShell>
  );
}
