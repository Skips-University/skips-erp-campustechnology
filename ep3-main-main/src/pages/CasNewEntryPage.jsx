import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import * as XLSX from "xlsx";
import CryptoJS from "crypto-js";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Cancel, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const defaultYears = ["2025-26", "2026-27", "2027-28", "2028-29", "2029-30"];
const importSources = [
  { key: "workload", label: "Workload" },
  { key: "resources", label: "Resources" },
  { key: "quizzes", label: "Quizzes" },
  { key: "attendance", label: "Attendance" },
  { key: "assessment", label: "Assessment marks" }
];
const blank = {
  academicyear: "2026-27",
  facultyname: global1.name || "",
  facultyemail: global1.user || "",
  department: global1.department || "",
  designation: "",
  section: "",
  group: "",
  item: "",
  activitytype: "",
  title: "",
  description: "",
  date: "",
  fromdate: "",
  todate: "",
  quantity: 1,
  scoreperunit: 0,
  maxscore: 0,
  scoreclaimed: 0,
  evidence: "",
  status: "Added",
  remarks: ""
};
const headers = {
  academicyear: "Academic Year",
  facultyname: "Faculty Name",
  facultyemail: "Faculty Email",
  department: "Department",
  designation: "Designation",
  section: "Section",
  group: "Group",
  item: "Item",
  activitytype: "Activity Type",
  title: "Title",
  description: "Description",
  date: "Date",
  fromdate: "From Date",
  todate: "To Date",
  quantity: "Quantity",
  scoreperunit: "Score Per Unit",
  maxscore: "Max Score",
  scoreclaimed: "Score Claimed",
  evidence: "Evidence",
  status: "Status",
  remarks: "Remarks"
};
const norm = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const uniqueSorted = (values) => [...new Set(values.filter(Boolean).map((item) => String(item).trim()))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const mapHeaders = Object.fromEntries(Object.entries(headers).map(([key, label]) => [norm(label), key]));
const teachingItem = "Classes / workload assigned";
const encodePath = (key) => String(key || "").split("/").map(encodeURIComponent).join("/");
const s3Host = (bucket, region) => region === "us-east-1" ? `${bucket}.s3.amazonaws.com` : `${bucket}.s3.${region}.amazonaws.com`;
const fileUrl = (bucket, region, key) => `https://${s3Host(bucket, region)}/${encodePath(key)}`;
const hmac = (key, value) => CryptoJS.HmacSHA256(value, key);
const sha256Hex = (value) => CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
const arrayBufferToWordArray = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const words = [];
  for (let i = 0; i < bytes.length; i += 1) words[i >>> 2] |= bytes[i] << (24 - (i % 4) * 8);
  return CryptoJS.lib.WordArray.create(words, bytes.length);
};
const signingKey = (secret, dateStamp, region) => {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, "s3");
  return hmac(kService, "aws4_request");
};
const signedS3Put = async ({ config, key, body, contentType }) => {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = config.region;
  const host = s3Host(config.bucket, region);
  const canonicalUri = `/${encodePath(key)}`;
  const payloadHash = CryptoJS.SHA256(arrayBufferToWordArray(body)).toString(CryptoJS.enc.Hex);
  const headers = {
    "content-type": contentType || "application/octet-stream",
    host,
    "x-amz-acl": "public-read",
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate
  };
  const sortedHeaderKeys = Object.keys(headers).map((item) => item.toLowerCase()).sort();
  const lowerHeaders = Object.fromEntries(Object.entries(headers).map(([header, value]) => [header.toLowerCase(), value]));
  const canonicalHeaders = sortedHeaderKeys.map((header) => `${header}:${String(lowerHeaders[header]).trim()}\n`).join("");
  const signedHeaders = sortedHeaderKeys.join(";");
  const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256Hex(canonicalRequest)].join("\n");
  const signature = hmac(signingKey(config.password, dateStamp, region), stringToSign).toString(CryptoJS.enc.Hex);
  const response = await fetch(`https://${host}${canonicalUri}`, {
    method: "PUT",
    headers: {
      "content-type": headers["content-type"],
      "x-amz-acl": headers["x-amz-acl"],
      "x-amz-content-sha256": headers["x-amz-content-sha256"],
      "x-amz-date": headers["x-amz-date"],
      Authorization: `AWS4-HMAC-SHA256 Credential=${config.username}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
    },
    body
  });
  if (!response.ok) throw new Error(await response.text().catch(() => "AWS upload failed"));
  return fileUrl(config.bucket, config.region, key);
};

export default function CasNewEntryPage() {
  const [options, setOptions] = useState({ rules: [], academicyears: [], sections: [], groups: [], items: [], statuses: [] });
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ bySection: [], totalClaimed: 0, totalApproved: 0 });
  const [workloads, setWorkloads] = useState([]);
  const [selectedWorkloadIds, setSelectedWorkloadIds] = useState([]);
  const [awsConfig, setAwsConfig] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ academicyear: "2026-27", section: "", group: "", item: "", status: "" });
  const [uploadRows, setUploadRows] = useState([]);
  const [selectedSources, setSelectedSources] = useState(["workload", "resources", "quizzes", "attendance", "assessment"]);
  const [selectedEntryIds, setSelectedEntryIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRows();
    loadAwsConfig();
  }, []);

  useEffect(() => {
    if (form.item === teachingItem) loadWorkloads(form.academicyear);
  }, [form.item, form.academicyear]);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/casnew/options", { params: { colid: global1.colid } });
      setOptions(res.data || {});
    } catch {
      setOptions({ rules: [], academicyears: [], sections: [], groups: [], items: [], statuses: [] });
    }
  };

  const loadAwsConfig = async () => {
    try {
      const res = await ep1.get("/api/v2/aws-config", { params: { colid: global1.colid } });
      const list = res.data || [];
      setAwsConfig(list.find((item) => item.default === "Yes" && String(item.type || "").toLowerCase() === "aws") || list.find((item) => String(item.type || "").toLowerCase() === "aws") || null);
    } catch {
      setAwsConfig(null);
    }
  };

  const loadWorkloads = async (academicyear = form.academicyear) => {
    try {
      const res = await ep1.get("/api/v2/casnew/workloads", { params: { colid: global1.colid, academicyear, facultyemail: global1.user } });
      setWorkloads(res.data.data || []);
    } catch {
      setWorkloads([]);
    }
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const params = { colid: global1.colid, facultyemail: global1.user };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/casnew/entries", { params });
      setRows(res.data.data || []);
      setSelectedEntryIds([]);
      setSummary(res.data.summary || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load CAS entries");
    } finally {
      setLoading(false);
    }
  };

  const yearOptions = useMemo(() => uniqueSorted([...defaultYears, ...(options.academicyears || []), ...rows.map((row) => row.academicyear)]), [options.academicyears, rows]);
  const sectionOptions = useMemo(() => uniqueSorted([...(options.sections || []), ...rows.map((row) => row.section)]), [options.sections, rows]);
  const filteredGroupOptions = useMemo(() => {
    const ruleGroups = (options.rules || []).filter((rule) => !form.section || rule.section === form.section).map((rule) => rule.group);
    const rowGroups = rows.filter((row) => !form.section || row.section === form.section).map((row) => row.group);
    return uniqueSorted([...ruleGroups, ...rowGroups]);
  }, [options.rules, rows, form.section]);
  const filteredItemOptions = useMemo(() => {
    const ruleItems = (options.rules || []).filter((rule) => (
      (!form.section || rule.section === form.section)
      && (!form.group || rule.group === form.group)
    )).map((rule) => rule.item);
    const rowItems = rows.filter((row) => (
      (!form.section || row.section === form.section)
      && (!form.group || row.group === form.group)
    )).map((row) => row.item);
    return uniqueSorted([...ruleItems, ...rowItems]);
  }, [options.rules, rows, form.section, form.group]);
  const filteredFilterGroupOptions = useMemo(() => {
    const ruleGroups = (options.rules || []).filter((rule) => !filters.section || rule.section === filters.section).map((rule) => rule.group);
    const rowGroups = rows.filter((row) => !filters.section || row.section === filters.section).map((row) => row.group);
    return uniqueSorted([...ruleGroups, ...rowGroups]);
  }, [options.rules, rows, filters.section]);
  const filteredFilterItemOptions = useMemo(() => {
    const ruleItems = (options.rules || []).filter((rule) => (
      (!filters.section || rule.section === filters.section)
      && (!filters.group || rule.group === filters.group)
    )).map((rule) => rule.item);
    const rowItems = rows.filter((row) => (
      (!filters.section || row.section === filters.section)
      && (!filters.group || row.group === filters.group)
    )).map((row) => row.item);
    return uniqueSorted([...ruleItems, ...rowItems]);
  }, [options.rules, rows, filters.section, filters.group]);
  const statusOptions = useMemo(() => uniqueSorted([...(options.statuses || []), "Added", "Submitted", "Approved", "Rejected"]), [options.statuses]);
  const calculatedScore = useMemo(() => {
    const qty = Number(form.quantity) || 0;
    const score = qty * (Number(form.scoreperunit) || 0);
    return Number(form.maxscore) > 0 ? Math.min(score, Number(form.maxscore)) : score;
  }, [form.quantity, form.scoreperunit, form.maxscore]);

  const updateForm = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "section") {
        const rule = (options.rules || []).find((item) => item.section === value);
        if (rule) Object.assign(next, { group: rule.group, item: rule.item, activitytype: rule.activitytype, scoreperunit: rule.scoreperunit, maxscore: rule.maxscore });
      }
      if (field === "group") {
        const rule = (options.rules || []).find((item) => item.section === next.section && item.group === value);
        if (rule) Object.assign(next, { item: rule.item, activitytype: rule.activitytype, scoreperunit: rule.scoreperunit, maxscore: rule.maxscore });
      }
      if (field === "item") {
        const rule = (options.rules || []).find((item) => item.section === next.section && item.group === next.group && item.item === value);
        if (rule) Object.assign(next, { activitytype: rule.activitytype, scoreperunit: rule.scoreperunit, maxscore: rule.maxscore });
      }
      return next;
    });
  };

  const workloadLabel = (item) => `${item.academicyear} | ${item.program || ""} ${item.programcode || ""} | Sem ${item.semester || ""} | ${item.course || ""} (${item.coursecode || ""}) | ${item.hoursperweek || 0} hours/week`;

  const workloadPayload = (row, base = form) => ({
    ...base,
    academicyear: row.academicyear || base.academicyear,
    facultyname: row.facultyname || base.facultyname,
    facultyemail: row.facultyemail || base.facultyemail,
    department: row.facultydepartment || base.department,
    title: `${row.course || row.coursecode || "Course"} workload`,
    description: `${row.program || ""} ${row.programcode || ""} ${row.semester ? `Semester ${row.semester}` : ""} ${row.subject || ""} ${row.hoursperweek || 0} hours/week`,
    quantity: row.hoursperweek || 1,
    source: "Workload Allocation",
    sourcemodel: "workloadassignmentds",
    sourceref: row._id
  });

  const selectWorkloads = (ids) => {
    setSelectedWorkloadIds(ids);
    const row = workloads.find((item) => item._id === ids[0]);
    if (!row) return;
    setForm((prev) => ({ ...prev, ...workloadPayload(row, prev) }));
  };

  const uploadDocument = async () => {
    try {
      setError("");
      if (!awsConfig) return setError("Default AWS configuration is not available");
      if (!docFile) return setError("Select a document first");
      setBusy(true);
      const safeName = docFile.name.replace(/[^\w.\-() ]/g, "_");
      const key = `${global1.colid}/cas-new/${global1.user || "user"}/${Date.now()}-${safeName}`;
      const buffer = await docFile.arrayBuffer();
      const url = await signedS3Put({ config: awsConfig, key, body: buffer, contentType: docFile.type || "application/octet-stream" });
      updateForm("evidence", url);
      setDocFile(null);
      const input = document.getElementById("cas-new-document-input");
      if (input) input.value = "";
      setMessage("Document uploaded and evidence link added");
    } catch (err) {
      setError(err.message || "Unable to upload document");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setForm({ ...blank, academicyear: filters.academicyear || "2026-27" });
    setSelectedWorkloadIds([]);
    setEditingId("");
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      setError("");
      if (!editingId && form.item === teachingItem) {
        if (!selectedWorkloadIds.length) {
          setError("Select at least one workload allocation");
          setBusy(false);
          return;
        }
        const selectedRows = workloads.filter((row) => selectedWorkloadIds.includes(row._id));
        for (const row of selectedRows) {
          await ep1.post("/api/v2/casnew/entry", { ...workloadPayload(row), colid: global1.colid, user: global1.user });
        }
        setMessage(`${selectedRows.length} workload CAS entries added`);
      } else {
        await ep1.post("/api/v2/casnew/entry", { ...form, id: editingId, colid: global1.colid, user: global1.user });
        setMessage(editingId ? "CAS entry updated" : "CAS entry added");
      }
      reset();
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save CAS entry");
    } finally {
      setBusy(false);
    }
  };

  const edit = (row) => {
    setEditingId(row._id);
    setForm({ ...blank, ...row });
    setSelectedWorkloadIds(row.sourceref ? [row.sourceref] : []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this CAS entry?")) return;
    try {
      await ep1.post("/api/v2/casnew/entry-delete", { id: row._id, colid: global1.colid });
      setMessage("CAS entry deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete entry");
    }
  };

  const bulkDelete = async () => {
    if (!selectedEntryIds.length) {
      setError("Select CAS entries to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedEntryIds.length} selected CAS entries?`)) return;
    try {
      setBusy(true);
      const res = await ep1.post("/api/v2/casnew/entries-bulk-delete", { ids: selectedEntryIds, colid: global1.colid });
      setMessage(`Deleted ${res.data.deleted || 0} CAS entries`);
      setSelectedEntryIds([]);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete selected entries");
    } finally {
      setBusy(false);
    }
  };

  const template = () => {
    const ws = XLSX.utils.json_to_sheet([Object.fromEntries(Object.entries(headers).map(([key, label]) => [label, blank[key] || ""]))]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CAS New");
    XLSX.writeFile(wb, "CAS_New_Template.xlsx");
  };

  const readExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const parsed = XLSX.utils.sheet_to_json(ws, { defval: "" }).map((row, index) => {
      const item = { rowNumber: index + 2, facultyname: global1.name, facultyemail: global1.user, department: global1.department };
      Object.entries(row).forEach(([header, value]) => {
        const key = mapHeaders[norm(header)];
        if (key) item[key] = value;
      });
      return item;
    });
    setUploadRows(parsed);
    setMessage(`${parsed.length} rows ready for upload`);
  };

  const upload = async () => {
    try {
      setBusy(true);
      const res = await ep1.post("/api/v2/casnew/bulk-upload", { colid: global1.colid, user: global1.user, items: uploadRows });
      setMessage(`Uploaded ${res.data.inserted || 0} rows`);
      setUploadRows([]);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    } finally {
      setBusy(false);
    }
  };

  const importNepLms = async () => {
    try {
      setBusy(true);
      setError("");
      const res = await ep1.post("/api/v2/casnew/import-neplms", {
        colid: global1.colid,
        academicyear: filters.academicyear || form.academicyear,
        facultyemail: global1.user,
        facultyname: global1.name,
        department: global1.department,
        user: global1.user,
        sources: selectedSources
      });
      setMessage(`Imported/updated ${res.data.imported || 0} NEP LMS CAS entries`);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "NEP LMS import failed");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { field: "actions", headerName: "Actions", width: 120, sortable: false, renderCell: (params) => (
      <Stack direction="row">
        <Tooltip title="Edit"><IconButton size="small" onClick={() => edit(params.row)}><Edit fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => remove(params.row)}><Delete fontSize="small" /></IconButton></Tooltip>
      </Stack>
    ) },
    { field: "academicyear", headerName: "Academic Year", width: 130 },
    { field: "section", headerName: "Section", width: 260 },
    { field: "group", headerName: "Group", width: 220 },
    { field: "item", headerName: "Item", width: 220 },
    { field: "title", headerName: "Title", width: 240 },
    { field: "quantity", headerName: "Qty", width: 90, type: "number" },
    { field: "scoreclaimed", headerName: "Claimed", width: 110, type: "number" },
    { field: "scoreapproved", headerName: "Approved", width: 110, type: "number" },
    { field: "currentlevel", headerName: "Level", width: 90, type: "number" },
    { field: "source", headerName: "Source", width: 120 },
    { field: "evidence", headerName: "Evidence", width: 220 },
    { field: "status", headerName: "Status", width: 120 }
  ];

  return (
    <MenuPageShell title="CAS New Entry">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>UGC CAS Appraisal Entry</Typography>
            <Typography variant="body2" color="text.secondary">Add or import CAS data. Scores are calculated automatically from locked CAS rules and sent for approval.</Typography>
          </Box>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {["academicyear", "section", "group", "item", "status"].map((field) => (
              <Grid item xs={12} md={field === "item" ? 3 : 2} key={field}>
                <TextField select fullWidth size="small" label={headers[field] || field} value={filters[field]} onChange={(event) => setFilters((prev) => ({ ...prev, [field]: event.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {(field === "academicyear" ? yearOptions : field === "section" ? sectionOptions : field === "group" ? filteredFilterGroupOptions : field === "item" ? filteredFilterItemOptions : statusOptions).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Refresh />} onClick={() => loadRows()} sx={{ height: 40 }}>Load</Button></Grid>
          </Grid>
        </Paper>

        <Paper component="form" onSubmit={save} sx={{ p: 2, mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>CAS score parameters are preconfigured and locked. Claimed score is calculated from quantity, score per unit, and maximum score.</Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth required label="Academic Year" value={form.academicyear} onChange={(e) => updateForm("academicyear", e.target.value)}>{yearOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth required label="Section" value={form.section} onChange={(e) => updateForm("section", e.target.value)}>{sectionOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth required label="Group" value={form.group} onChange={(e) => updateForm("group", e.target.value)}>{filteredGroupOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField select fullWidth required label="Item" value={form.item} onChange={(e) => updateForm("item", e.target.value)}>{filteredItemOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            {form.item === teachingItem && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select workload allocation</InputLabel>
                  <Select
                    multiple
                    label="Select workload allocation"
                    value={selectedWorkloadIds}
                    onChange={(e) => selectWorkloads(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                    renderValue={(selected) => selected.length ? `${selected.length} workload allocation${selected.length > 1 ? "s" : ""} selected` : "Select workload"}
                  >
                    {workloads.map((item) => (
                      <MenuItem key={item._id} value={item._id}>
                        <Checkbox checked={selectedWorkloadIds.includes(item._id)} />
                        <Typography variant="body2">{workloadLabel(item)}</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>Teaching workload CAS entries should be selected from workload allocation. All selected workloads will be added separately.</Typography>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} md={4}><TextField fullWidth required label="Title" value={form.title} onChange={(e) => updateForm("title", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Quantity" value={form.quantity} onChange={(e) => updateForm("quantity", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Score / Unit" value={form.scoreperunit} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Max Score" value={form.maxscore} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Calculated Score" value={calculatedScore} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => updateForm("date", e.target.value)} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Evidence Link" value={form.evidence} onChange={(e) => updateForm("evidence", e.target.value)} /></Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ height: "100%" }}>
                <Button variant="outlined" component="label" startIcon={<UploadFile />} sx={{ height: 56, whiteSpace: "nowrap" }}>
                  Select Doc
                  <input id="cas-new-document-input" hidden type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
                </Button>
                <Button variant="contained" disabled={!docFile || busy} onClick={uploadDocument} sx={{ height: 56, whiteSpace: "nowrap" }}>
                  Upload
                </Button>
              </Stack>
              {docFile && <Typography variant="caption" color="text.secondary">{docFile.name}</Typography>}
            </Grid>
            <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={2} label="Description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} /></Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" startIcon={<Save />} disabled={busy}>{busy ? "Working..." : editingId ? "Update" : "Save"}</Button>
            <Button variant="outlined" startIcon={<Cancel />} onClick={reset}>Cancel</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }}>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={template}>Template</Button>
            <Button variant="outlined" component="label" startIcon={<UploadFile />}>Choose Excel<input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} /></Button>
            <Button variant="contained" startIcon={<Add />} disabled={!uploadRows.length || busy} onClick={upload}>Upload {uploadRows.length ? `(${uploadRows.length})` : ""}</Button>
            <Box sx={{ flex: 1 }} />
            {importSources.map((src) => <FormControlLabel key={src.key} control={<Checkbox checked={selectedSources.includes(src.key)} onChange={(e) => setSelectedSources((prev) => e.target.checked ? [...prev, src.key] : prev.filter((item) => item !== src.key))} />} label={src.label} />)}
            <Button variant="contained" color="secondary" disabled={busy} onClick={importNepLms}>Import from NEP LMS</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ p: 1 }}>
            <Typography variant="body2" color="text.secondary">{selectedEntryIds.length} selected</Typography>
            <Button variant="contained" color="error" startIcon={<Delete />} disabled={!selectedEntryIds.length || busy} onClick={bulkDelete}>Bulk Delete</Button>
          </Stack>
          <DataGrid
            checkboxSelection
            disableRowSelectionOnClick
            rows={rows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            rowSelectionModel={selectedEntryIds}
            onRowSelectionModelChange={(ids) => setSelectedEntryIds(Array.from(ids))}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "cas_new_entries" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1900 }}
          />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
