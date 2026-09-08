import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const emptyFilter = { field: "", value: "" };
const systemHiddenFields = new Set([]);
const uploadSkipFields = new Set(["createdAt", "updatedAt", "paiddate", "provisionalpaiddate"]);

const fieldKey = (field) => field.replace(/^extraFields\./, "extra_").replace(/[^a-zA-Z0-9_]/g, "_");
const getFieldValue = (row, field) => {
  if (field.startsWith("extraFields.")) return row.extraFields?.[field.replace("extraFields.", "")] || "";
  const value = row[field];
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return value;
};
const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const parseNumber = (value) => {
  if (value === "" || value === undefined || value === null) return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const emptyGeneralAdmission = {
  academicyear: "",
  regulation: "",
  program: "",
  programcode: "",
  semester: "",
  section: ""
};

export default function AdmissionApplicationManagementPage() {
  const [fieldList, setFieldList] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [includeCredentials, setIncludeCredentials] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sending, setSending] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [admitting, setAdmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [bulkFromStatus, setBulkFromStatus] = useState("Applied");
  const [bulkStatus, setBulkStatus] = useState("Applied");
  const [generalAdmission, setGeneralAdmission] = useState({ ...emptyGeneralAdmission });
  const [generalOptions, setGeneralOptions] = useState({ academicyears: [], regulations: [], programs: [] });
  const [contactOverrides, setContactOverrides] = useState({});
  const [admissionErrors, setAdmissionErrors] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadGeneralOptions();
    searchApplications();
  }, []);

  useEffect(() => {
    loadGeneralOptions(generalAdmission.academicyear, generalAdmission.regulation);
  }, [generalAdmission.academicyear, generalAdmission.regulation]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const res = await ep1.get("/api/v2/admission-application-management/options", {
        params: { colid: global1.colid }
      });
      setFieldList((res.data?.fields || []).filter((field) => !systemHiddenFields.has(field.field)));
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load application fields");
    } finally {
      setLoadingOptions(false);
    }
  };

  const activeFilters = (sourceFilters = filters) => (Array.isArray(sourceFilters) ? sourceFilters : filters)
    .filter((filter) => filter.field && String(filter.value || "").trim())
    .map((filter) => ({ field: filter.field, value: filter.value }));

  const searchApplications = async (sourceFilters = filters) => {
    try {
      setLoadingRows(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/admission-application-management/search", {
        colid: global1.colid,
        filters: activeFilters(sourceFilters)
      });
      setRows(res.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load applications");
    } finally {
      setLoadingRows(false);
    }
  };

  const loadGeneralOptions = async (academicyear = "", regulation = "") => {
    try {
      const res = await ep1.get("/api/v2/admission-application-management/general-options", {
        params: { colid: global1.colid, academicyear, regulation }
      });
      setGeneralOptions({
        academicyears: res.data?.academicyears || [],
        regulations: res.data?.regulations || [],
        programs: res.data?.programs || []
      });
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load general admission options");
    }
  };

  const updateFilter = (index, patch) => {
    setFilters((prev) => prev.map((filter, itemIndex) => (
      itemIndex === index ? { ...filter, ...patch, ...(patch.field ? { value: "" } : {}) } : filter
    )));
  };

  const removeFilter = (index) => {
    setFilters((prev) => prev.length === 1 ? [{ ...emptyFilter }] : prev.filter((item, itemIndex) => itemIndex !== index));
  };

  const clearFilters = () => {
    const nextFilters = [{ ...emptyFilter }];
    setFilters(nextFilters);
    searchApplications(nextFilters);
  };

  const selectedRows = useMemo(() => rows.filter((row) => selectedIds.includes(row._id)), [rows, selectedIds]);

  useEffect(() => {
    setContactOverrides((prev) => {
      const next = {};
      selectedRows.forEach((row) => {
        next[row._id] = {
          email: prev[row._id]?.email ?? row.email ?? "",
          phone: prev[row._id]?.phone ?? row.phone ?? ""
        };
      });
      return next;
    });
  }, [selectedRows]);

  const updateGeneralAdmission = (patch) => {
    setGeneralAdmission((prev) => ({ ...prev, ...patch }));
  };

  const formatAdmissionError = (item) => {
    const detailText = item?.details && typeof item.details === "object"
      ? Object.entries(item.details).map(([field, msg]) => `${field}: ${msg}`).join(", ")
      : "";
    return `${item?.name || item?.email || item?.applicationId || "Applicant"}: ${item?.msg || item?.message || "Unable to admit"}${detailText ? ` (${detailText})` : ""}`;
  };

  const admitSelectedApplicants = async () => {
    setAdmissionErrors([]);
    if (!selectedIds.length) {
      setError("Select at least one applicant from the grid");
      return;
    }
    const missingContacts = selectedRows.filter((row) => !String(contactOverrides[row._id]?.email || "").trim() || !String(contactOverrides[row._id]?.phone || "").trim());
    if (missingContacts.length) {
      setError("Email and phone are required for every selected applicant");
      return;
    }
    if (!generalAdmission.academicyear || !generalAdmission.regulation || !generalAdmission.program || !generalAdmission.programcode || !generalAdmission.semester || !generalAdmission.section) {
      setError("Academic year, regulation, program, semester and section are required");
      return;
    }
    if (!window.confirm(`Admit ${selectedIds.length} selected applicant${selectedIds.length === 1 ? "" : "s"}?`)) return;
    try {
      setAdmitting(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/admission-application-management/general-admit", {
        colid: global1.colid,
        user: global1.user,
        institution: global1.insname,
        applicationIds: selectedIds,
        contactOverrides,
        ...generalAdmission
      });
      const errors = res.data?.errors || [];
      setMessage(`${res.data?.msg || "Admission completed"}${errors.length ? `, Failed: ${errors.length}` : ""}`);
      setAdmissionErrors(errors);
      setError(errors.length ? `Admission failed for ${errors.length} applicant${errors.length === 1 ? "" : "s"}. See details below.` : "");
      await Promise.all([searchApplications(), loadOptions(), loadGeneralOptions(generalAdmission.academicyear, generalAdmission.regulation)]);
    } catch (err) {
      const responseErrors = err.response?.data?.errors || [];
      setAdmissionErrors(responseErrors);
      setError(err.response?.data?.msg || err.response?.data?.message || (responseErrors.length ? "Unable to admit selected applicants. See details below." : "Unable to admit selected applicants"));
    } finally {
      setAdmitting(false);
    }
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) {
      setError("Select at least one application");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} selected application${selectedIds.length === 1 ? "" : "s"}?`)) return;
    try {
      setDeleting(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/admission-application-management/bulk-delete", {
        colid: global1.colid,
        ids: selectedIds
      });
      setMessage(`Deleted ${res.data?.deleted || 0} application${Number(res.data?.deleted || 0) === 1 ? "" : "s"}.`);
      await searchApplications();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete selected applications");
    } finally {
      setDeleting(false);
    }
  };

  const updateSelectedStatus = async () => {
    if (!selectedIds.length) {
      setError("Select at least one application");
      return;
    }
    if (!bulkStatus) {
      setError("Select application status");
      return;
    }
    if (!bulkFromStatus) {
      setError("Select source application status");
      return;
    }
    if (bulkFromStatus === bulkStatus) {
      setError("Source and target status should be different");
      return;
    }
    if (!window.confirm(`For selected applications, change status from ${bulkFromStatus} to ${bulkStatus}?`)) return;
    try {
      setStatusUpdating(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/admission-application-management/bulk-status", {
        colid: global1.colid,
        ids: selectedIds,
        fromStatus: bulkFromStatus,
        applicationstatus: bulkStatus
      });
      setMessage(`${res.data?.msg || "Status updated"}. Updated ${res.data?.modified || 0} application${Number(res.data?.modified || 0) === 1 ? "" : "s"}.`);
      await Promise.all([searchApplications(), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to update selected application status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const sendEmail = async () => {
    if (!selectedIds.length) {
      setError("Select at least one recipient");
      return;
    }
    if (!messageText.trim()) {
      setError("Message is required");
      return;
    }
    try {
      setSending(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/admission-application-management/send-email", {
        colid: global1.colid,
        ids: selectedIds,
        subject,
        message: messageText,
        includeCredentials,
        institution: global1.insname
      });
      const errors = res.data?.errors || [];
      setMessage(`${res.data?.msg || "Email sent"}${errors.length ? `, Failed: ${errors.length}` : ""}`);
      setError(errors.length ? errors.slice(0, 5).map((item) => `${item.email}: ${item.msg}`).join(" | ") : "");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to send email");
    } finally {
      setSending(false);
    }
  };

  const uploadFields = useMemo(() => fieldList.filter((field) => !systemHiddenFields.has(field.field) && !uploadSkipFields.has(field.field)), [fieldList]);

  const templateHeaderMap = useMemo(() => {
    const map = new Map();
    uploadFields.forEach((field) => {
      map.set(normalizeHeader(field.label), field);
      map.set(normalizeHeader(field.field), field);
      if (field.field.startsWith("extraFields.")) {
        const customName = field.field.replace("extraFields.", "");
        map.set(normalizeHeader(customName), field);
        map.set(normalizeHeader(`extra_${customName}`), field);
      }
    });
    return map;
  }, [uploadFields]);

  const downloadTemplate = () => {
    const row = {};
    uploadFields.forEach((field) => {
      const optionValue = (options[field.field] || [])[0] || "";
      row[field.label || field.field] = optionValue;
    });
    row.Name = row.Name || "Applicant Name";
    row.Email = row.Email || "applicant@example.com";
    row.Phone = row.Phone || "9999999999";
    row["Application Status"] = row["Application Status"] || "Applied";
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([row]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    XLSX.writeFile(workbook, "admission_application_management_template.xlsx");
  };

  const bulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || bulkUploading) return;
    try {
      setBulkUploading(true);
      setError("");
      setMessage("");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!excelRows.length) {
        setError("No rows found in Excel file");
        return;
      }
      const items = excelRows.map((row, index) => {
        const item = {
          rowNumber: index + 2,
          colid: global1.colid,
          user: global1.user,
          extraFields: {}
        };
        Object.entries(row).forEach(([header, value]) => {
          const field = templateHeaderMap.get(normalizeHeader(header));
          if (!field) return;
          if (field.field.startsWith("extraFields.")) {
            item.extraFields[field.field.replace("extraFields.", "")] = value;
          } else {
            item[field.field] = ["age", "marks_12", "marks_10", "marks_UG", "marks_PG", "tenthmarks", "twelvemarks", "externaltheorymarks", "englishmarks", "applicationfeeamount", "paidamount", "provisionalfeeamount", "provisionalpaidamount"].includes(field.field)
              ? parseNumber(value)
              : value;
          }
        });
        item.applicationstatus = item.applicationstatus || "Applied";
        item.dateofapplication = item.dateofapplication || new Date().toISOString().slice(0, 10);
        return item;
      });
      const res = await ep1.post("/admission-dynamic/applications-bulk", {
        colid: global1.colid,
        items
      });
      const errors = res.data?.errors || [];
      setMessage(`Bulk upload completed. Inserted: ${res.data?.inserted || 0}${errors.length ? `, Errors: ${errors.length}` : ""}`);
      setError(errors.length ? errors.slice(0, 5).map((item) => `Row ${item.rowNumber}: ${item.msg}`).join(" | ") : "");
      await Promise.all([searchApplications(), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload Excel file");
    } finally {
      setBulkUploading(false);
    }
  };

  const columns = useMemo(() => {
    const visibleFields = fieldList.filter((field) => !systemHiddenFields.has(field.field));
    const mainColumns = visibleFields.map((field) => ({
      field: fieldKey(field.field),
      headerName: field.label || field.field,
      minWidth: field.field === "email" || field.field === "programapplied" ? 210 : 150,
      flex: field.source === "custom" ? 1 : undefined,
      valueGetter: (params) => getFieldValue(params.row, field.field)
    }));
    return [
      { field: "_id", headerName: "Application ID", width: 210 },
      ...mainColumns
    ];
  }, [fieldList]);

  return (
    <MenuPageShell title="Application Management">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Application Management</Typography>
              <Typography color="text.secondary">Search across all admission forms, select applicants, delete in bulk, or send email messages.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadTemplate} disabled={loadingOptions || bulkUploading}>
                Template
              </Button>
              <Button variant="contained" component="label" startIcon={<UploadFileIcon />} disabled={bulkUploading}>
                {bulkUploading ? "Uploading..." : "Bulk Upload"}
                <input hidden type="file" accept=".xlsx,.xls" onChange={bulkUpload} disabled={bulkUploading} />
              </Button>
              <Button variant="outlined" startIcon={<FilterAltIcon />} onClick={() => searchApplications()} disabled={loadingRows}>
                {loadingRows ? "Loading..." : "Load"}
              </Button>
              <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={bulkDelete} disabled={deleting || !selectedIds.length}>
                {deleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {(loadingOptions || loadingRows || deleting || sending || bulkUploading || admitting || statusUpdating) && (
          <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
              <Typography fontWeight={800}>
                {statusUpdating ? "Updating selected application status..." : admitting ? "Admitting selected applicants..." : bulkUploading ? "Uploading applications..." : sending ? "Sending emails..." : deleting ? "Deleting selected applications..." : loadingRows ? "Loading applications..." : "Loading fields..."}
              </Typography>
              <Typography variant="body2" color="text.secondary">Please wait until the action completes.</Typography>
            </Stack>
            <LinearProgress />
          </Paper>
        )}

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {admissionErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAdmissionErrors([])}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>Admission errors</Typography>
            <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
              {admissionErrors.map((item, index) => (
                <Box component="li" key={`${item.applicationId || item.email || index}-${index}`} sx={{ mb: 0.5 }}>
                  {formatAdmissionError(item)}
                </Box>
              ))}
            </Box>
          </Alert>
        )}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={800}>Dynamic Filters</Typography>
            <Button startIcon={<AddIcon />} onClick={() => setFilters((prev) => [...prev, { ...emptyFilter }])}>Add Filter</Button>
          </Stack>
          <Grid container spacing={2}>
            {filters.map((filter, index) => (
              <React.Fragment key={`${index}-${filter.field || "field"}`}>
                <Grid item xs={12} md={4}>
                  <TextField select fullWidth label="Field" value={filter.field} onChange={(event) => updateFilter(index, { field: event.target.value })}>
                    <MenuItem value="">Select field</MenuItem>
                    {fieldList.map((field) => (
                      <MenuItem key={field.field} value={field.field}>{field.label || field.field}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    freeSolo
                    options={options[filter.field] || []}
                    value={filter.value || ""}
                    onInputChange={(event, value) => updateFilter(index, { value })}
                    onChange={(event, value) => updateFilter(index, { value: value || "" })}
                    renderInput={(params) => <TextField {...params} label="Value" />}
                    disabled={!filter.field}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth color="error" variant="outlined" onClick={() => removeFilter(index)} sx={{ height: 56 }}>Remove</Button>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" onClick={() => searchApplications()} disabled={loadingRows} sx={{ height: 56 }}>
                {loadingRows ? "Loading..." : "Apply"}
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="text" onClick={clearFilters} disabled={loadingRows} sx={{ height: 56 }}>Clear</Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Bulk Status Change</Typography>
              <Typography color="text.secondary">Select applicants in the grid. Only those whose current status matches the first dropdown will be changed.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
              <TextField
                select
                label="If Status Is"
                value={bulkFromStatus}
                onChange={(event) => setBulkFromStatus(event.target.value)}
                sx={{ minWidth: 180 }}
              >
                {["Draft", "Applied", "Admitted"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField
                select
                label="Change To"
                value={bulkStatus}
                onChange={(event) => setBulkStatus(event.target.value)}
                sx={{ minWidth: 180 }}
              >
                {["Draft", "Applied", "Admitted"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <Button variant="contained" onClick={updateSelectedStatus} disabled={statusUpdating || !selectedIds.length} sx={{ height: 56 }}>
                {statusUpdating ? "Updating..." : `Change Status (${selectedIds.length})`}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>General Admission</Typography>
              <Typography color="text.secondary">Select applicants in the grid, complete contact details, and admit them in bulk.</Typography>
            </Box>
            <Button variant="contained" color="success" onClick={admitSelectedApplicants} disabled={admitting || !selectedIds.length}>
              {admitting ? "Admitting..." : `Admit Selected (${selectedIds.length})`}
            </Button>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2.4}>
              <TextField
                select
                fullWidth
                label="Academic Year"
                value={generalAdmission.academicyear}
                onChange={(event) => updateGeneralAdmission({ academicyear: event.target.value, regulation: "", program: "", programcode: "" })}
              >
                <MenuItem value="">Select year</MenuItem>
                {generalOptions.academicyears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField
                select
                fullWidth
                label="Regulation"
                value={generalAdmission.regulation}
                onChange={(event) => updateGeneralAdmission({ regulation: event.target.value, program: "", programcode: "" })}
              >
                <MenuItem value="">Select regulation</MenuItem>
                {generalOptions.regulations.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3.2}>
              <TextField
                select
                fullWidth
                label="Program and Program Code"
                value={generalAdmission.programcode}
                onChange={(event) => {
                  const selected = generalOptions.programs.find((item) => item.programcode === event.target.value) || {};
                  updateGeneralAdmission({ program: selected.program || "", programcode: selected.programcode || "" });
                }}
              >
                <MenuItem value="">Select program</MenuItem>
                {generalOptions.programs.map((item) => (
                  <MenuItem key={`${item.programcode}-${item.program}`} value={item.programcode}>{item.program} {item.programcode ? `(${item.programcode})` : ""}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Semester" value={generalAdmission.semester} onChange={(event) => updateGeneralAdmission({ semester: event.target.value })} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Section" value={generalAdmission.section} onChange={(event) => updateGeneralAdmission({ section: event.target.value })} />
            </Grid>
          </Grid>

          {selectedRows.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography fontWeight={800} sx={{ mb: 1 }}>Selected Applicants Contact Details</Typography>
              <Grid container spacing={1.5}>
                {selectedRows.map((row) => (
                  <React.Fragment key={row._id}>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Applicant" value={row.name || row.username || row._id} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={contactOverrides[row._id]?.email || ""}
                        onChange={(event) => setContactOverrides((prev) => ({ ...prev, [row._id]: { ...(prev[row._id] || {}), email: event.target.value } }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={contactOverrides[row._id]?.phone || ""}
                        onChange={(event) => setContactOverrides((prev) => ({ ...prev, [row._id]: { ...(prev[row._id] || {}), phone: event.target.value } }))}
                      />
                    </Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Send Message</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
            </Grid>
            <Grid item xs={12} md={8}>
              <FormControlLabel
                control={<Checkbox checked={includeCredentials} onChange={(event) => setIncludeCredentials(event.target.checked)} />}
                label="Include username and password"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={4} label="Message" value={messageText} onChange={(event) => setMessageText(event.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="contained" color="success" startIcon={<EmailIcon />} onClick={sendEmail} disabled={sending || !selectedIds.length} sx={{ height: 56 }}>
                {sending ? "Sending..." : `Send to Selected (${selectedIds.length})`}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={800}>Applications</Typography>
            <Typography color="text.secondary">{rows.length} records, {selectedIds.length} selected</Typography>
          </Stack>
          <Box sx={{ height: 640, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              checkboxSelection
              rowSelectionModel={selectedIds}
              onRowSelectionModelChange={(selection) => setSelectedIds(Array.from(selection?.ids || selection))}
              disableRowSelectionOnClick
              loading={loadingRows}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admission_application_management" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
