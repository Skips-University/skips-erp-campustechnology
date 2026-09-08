import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  Link,
  LinearProgress,
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
import { Logout, Refresh, Save } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const isEditable = (field) => /^yes$/i.test(String(field.editable || ""));
const nonStudentHiddenFields = new Set(["semester", "section"]);

function PageTop({ title, subtitle }) {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Breadcrumbs sx={{ mb: 0.5 }}>
            <Link underline="hover" color="inherit" href={global1.role === "Student" ? "/dashmclassenr1stud" : "/dashdashfacnew"}>Dashboard</Link>
            <Typography color="text.primary">Profile</Typography>
          </Breadcrumbs>
          <Typography variant="h5" fontWeight={900}>{title}</Typography>
          <Typography color="text.secondary">{subtitle}</Typography>
        </Box>
        <Button color="error" variant="outlined" startIcon={<Logout />} onClick={logout}>Logout</Button>
      </Stack>
    </Paper>
  );
}

function FieldControl({ field, value, onChange, disabled = false }) {
  const editable = isEditable(field) && !disabled;
  const common = {
    fullWidth: true,
    label: field.label || field.field,
    value: value ?? "",
    InputProps: { readOnly: !editable },
    onChange: (event) => onChange(field.field, event.target.value)
  };
  if (field.type === "dropdown" && Array.isArray(field.options) && field.options.length) {
    return (
      <FormControl fullWidth disabled={!editable}>
        <InputLabel>{field.label || field.field}</InputLabel>
        <Select label={field.label || field.field} value={value ?? ""} onChange={(event) => onChange(field.field, event.target.value)}>
          <MenuItem value="">Select</MenuItem>
          {field.options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </Select>
      </FormControl>
    );
  }
  if (field.type === "textarea") return <TextField {...common} multiline minRows={3} />;
  if (field.type === "date") return <TextField {...common} type="date" InputLabelProps={{ shrink: true }} />;
  if (field.type === "number") return <TextField {...common} type="number" />;
  return <TextField {...common} type={field.type === "email" ? "email" : "text"} />;
}

function ProfileBody({ student = false }) {
  const navigate = useNavigate();
  const [layout, setLayout] = useState([]);
  const [values, setValues] = useState({});
  const [pendingValues, setPendingValues] = useState({});
  const [tab, setTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [approvalStatus, setApprovalStatus] = useState([]);
  const [documentRequirements, setDocumentRequirements] = useState([]);
  const [documentUploads, setDocumentUploads] = useState([]);
  const [documentApprovalStatus, setDocumentApprovalStatus] = useState([]);
  const [documentFiles, setDocumentFiles] = useState({});
  const [documentDescriptions, setDocumentDescriptions] = useState({});
  const [uploadingDocumentId, setUploadingDocumentId] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState("");
  const [consentStatus, setConsentStatus] = useState(null);
  const role = global1.role || (student ? "Student" : "User");
  const consentGiven = Boolean(consentStatus?.hasConsent);

  const grouped = useMemo(() => {
    const map = new Map();
    layout
      .filter((field) => student || !nonStudentHiddenFields.has(String(field.field || "").toLowerCase()))
      .forEach((field) => {
      const key = field.tab || "Profile";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(field);
    });
    return [...map.entries()].map(([name, fields]) => ({
      name,
      taborder: Math.min(...fields.map((field) => Number(field.taborder || 0))),
      fields: fields.sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || String(a.label).localeCompare(String(b.label)))
    })).sort((a, b) => Number(a.taborder || 0) - Number(b.taborder || 0) || String(a.name).localeCompare(String(b.name)));
  }, [layout]);

  const uploadMap = useMemo(() => {
    const map = {};
    documentUploads.forEach((item) => {
      map[item.documentname] = item;
    });
    return map;
  }, [documentUploads]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/user-profile", {
        params: {
          colid: global1.colid,
          email: global1.user,
          role
        }
      });
      setLayout(res.data.layout || []);
      setValues(res.data.values || {});
      setPendingValues(res.data.pendingValues || {});
      setCurrentPhoto(res.data.user?.photo || "");
      const firstTab = [...(res.data.layout || [])]
        .sort((a, b) => Number(a.taborder || 0) - Number(b.taborder || 0) || String(a.tab || "").localeCompare(String(b.tab || "")) || Number(a.order || 0) - Number(b.order || 0))[0]?.tab || "Profile";
      setTab((old) => old || firstTab);
      const statusRes = await ep1.get("/api/v2/user-profile-approval-status", {
        params: { colid: global1.colid, owneruser: global1.user }
      });
      setApprovalStatus(statusRes.data.profile || []);
      const consentRes = await ep1.get("/api/v2/user-consent-status", {
        params: { colid: global1.colid, owneruser: global1.user, role }
      });
      setConsentStatus(consentRes.data || null);
      if (student) {
        const [reqRes, uploadRes] = await Promise.all([
          ep1.get("/api/v2/user-document-requirements", { params: { colid: global1.colid, role, status: "Active" } }),
          ep1.get("/api/v2/user-uploaded-documents", { params: { colid: global1.colid, role, owneruser: global1.user } })
        ]);
        setDocumentRequirements(reqRes.data || []);
        setDocumentUploads(uploadRes.data || []);
        setDocumentApprovalStatus(statusRes.data.documents || []);
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (doc) => {
    if (!consentGiven) {
      setError("Please provide data processing consent before uploading profile documents.");
      return;
    }
    const file = documentFiles[doc._id];
    if (!file) {
      setError("Please select a file");
      return;
    }
    try {
      setUploadingDocumentId(doc._id);
      setError("");
      setMessage("");
      const payload = new FormData();
      payload.append("file", file);
      payload.append("colid", global1.colid);
      payload.append("role", role);
      payload.append("documentrequirementid", doc._id);
      payload.append("documentname", doc.documentname);
      payload.append("description", documentDescriptions[doc._id] || doc.description || "");
      payload.append("owneruser", global1.user || "");
      payload.append("ownername", global1.name || "");
      payload.append("uploadedby", global1.user || "");
      await ep1.post("/api/v2/user-uploaded-documents/upload", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setDocumentFiles((prev) => ({ ...prev, [doc._id]: null }));
      setDocumentDescriptions((prev) => ({ ...prev, [doc._id]: "" }));
      setMessage(`${doc.documentname} uploaded and submitted for approval`);
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload document");
    } finally {
      setUploadingDocumentId("");
    }
  };

  const deleteUpload = async (row) => {
    if (!window.confirm("Delete this uploaded document record?")) return;
    try {
      setError("");
      setMessage("");
      await ep1.post("/api/v2/user-uploaded-documents-delete", { id: row._id, colid: global1.colid });
      setMessage("Uploaded document deleted");
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete uploaded document");
    }
  };

  const uploadPhoto = async (event) => {
    if (!consentGiven) {
      setError("Please provide data processing consent before uploading a profile photo.");
      return;
    }
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setPhotoUploading(true);
      setError("");
      setMessage("");
      const data = new FormData();
      data.append("photo", file);
      data.append("colid", global1.colid);
      data.append("user", global1.user || "");
      const uploadRes = await ep1.post("/api/v2/user-data-photo", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const photoUrl = uploadRes.data?.url || "";
      if (!photoUrl) throw new Error("Photo upload did not return a URL");
      await ep1.post("/api/v2/user-profile-photo-update", {
        colid: global1.colid,
        email: global1.user,
        photo: photoUrl
      });
      setCurrentPhoto(photoUrl);
      setValues((old) => ({ ...old, photo: photoUrl }));
      setMessage("Photo uploaded and updated in profile");
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Unable to upload photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  const requirementColumns = [
    { field: "documentname", headerName: "Document", width: 220 },
    { field: "category", headerName: "Category", width: 160 },
    { field: "description", headerName: "Description", width: 260 },
    { field: "mandatory", headerName: "Mandatory", width: 120 },
    {
      field: "uploaded",
      headerName: "Status",
      width: 140,
      renderCell: (params) => uploadMap[params.row.documentname]
        ? <Chip color="success" label="Uploaded" size="small" />
        : <Chip color={params.row.mandatory === "Yes" ? "warning" : "default"} label="Pending" size="small" />
    },
    {
      field: "file",
      headerName: "Upload",
      width: 430,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
          <Button size="small" variant="outlined" component="label">
            File
            <input hidden type="file" onChange={(e) => setDocumentFiles((prev) => ({ ...prev, [params.row._id]: e.target.files?.[0] || null }))} />
          </Button>
          <Typography variant="caption" noWrap sx={{ width: 130 }}>
            {documentFiles[params.row._id]?.name || "No file"}
          </Typography>
          <TextField
            size="small"
            label="Description"
            value={documentDescriptions[params.row._id] || ""}
            onKeyDown={(event) => event.stopPropagation()}
            onChange={(event) => setDocumentDescriptions((prev) => ({ ...prev, [params.row._id]: event.target.value }))}
          />
          <Button
            size="small"
            variant="contained"
            startIcon={<UploadFileIcon />}
            disabled={uploadingDocumentId === params.row._id || !consentGiven}
            onClick={() => uploadDocument(params.row)}
          >
            {uploadingDocumentId === params.row._id ? "Uploading..." : "Upload"}
          </Button>
        </Stack>
      )
    },
    {
      field: "link",
      headerName: "Current file",
      width: 220,
      renderCell: (params) => {
        const uploaded = uploadMap[params.row.documentname];
        return uploaded?.url ? <Link href={uploaded.url} target="_blank" rel="noreferrer">{uploaded.originalname || uploaded.filename || "Open"}</Link> : "";
      }
    }
  ];

  const uploadColumns = [
    { field: "role", headerName: "Role", width: 130 },
    { field: "documentname", headerName: "Document", width: 220 },
    { field: "description", headerName: "Description", width: 220 },
    {
      field: "url",
      headerName: "Link",
      width: 260,
      renderCell: (params) => params.value ? <Link href={params.value} target="_blank" rel="noreferrer">{params.row.originalname || params.row.filename || "Open file"}</Link> : ""
    },
    { field: "status", headerName: "Status", width: 120 },
    { field: "createdAt", headerName: "Uploaded on", width: 180, valueGetter: (params) => params.row.createdAt ? new Date(params.row.createdAt).toLocaleString() : "" },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => deleteUpload(params.row)}>Delete</Button>
    }
  ];

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!consentGiven) {
      setError("Please provide data processing consent before editing your profile.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/user-profile-update", {
        colid: global1.colid,
        email: global1.user,
        role,
        values
      });
      setMessage(res.data?.msg || "Profile changes submitted for approval.");
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  const active = grouped.find((group) => group.name === tab) || grouped[0] || { name: "Profile", fields: [] };

  return (
    <Box p={3}>
      <PageTop title={student ? "My profile" : "Profile edit"} subtitle="View and update fields permitted for your role." />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {(loading || uploadingDocumentId || photoUploading) && <LinearProgress sx={{ mb: 2 }} />}
      <Alert
        severity={consentGiven ? "success" : "warning"}
        sx={{ mb: 2 }}
        action={
          <Stack direction="row" spacing={1}>
            {!consentGiven && <Button color="inherit" size="small" onClick={() => navigate("/userconsent")}>Provide Consent</Button>}
            {consentGiven && <Button color="inherit" size="small" onClick={() => navigate("/userconsentwithdraw")}>Withdraw</Button>}
          </Stack>
        }
      >
        Data compliance notice: profile data is processed for institutional services, statutory compliance, academic or employment records, and communication. Consent status: {consentGiven ? `Active${consentStatus?.latest?.activitytime ? ` since ${new Date(consentStatus.latest.activitytime).toLocaleString()}` : ""}` : "Not given. Profile editing is inactive until consent is recorded."}
      </Alert>
      {student && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                component={currentPhoto ? "img" : "div"}
                src={currentPhoto || undefined}
                alt="Student"
                sx={{
                  width: 96,
                  height: 112,
                  border: "1px solid #d1d5db",
                  borderRadius: 1.5,
                  objectFit: "cover",
                  display: "grid",
                  placeItems: "center",
                  color: "text.secondary",
                  bgcolor: "#f8fafc"
                }}
              >
                {!currentPhoto ? "Photo" : null}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800}>Profile photo</Typography>
                <Typography color="text.secondary">Upload JPG, JPEG or PNG. The link will be saved in the photo column.</Typography>
                {currentPhoto && <Link href={currentPhoto} target="_blank" rel="noreferrer">Open current photo</Link>}
              </Box>
            </Stack>
            <Button variant="contained" component="label" disabled={photoUploading || !consentGiven} startIcon={<UploadFileIcon />}>
              {photoUploading ? "Uploading..." : "Upload Photo"}
              <input hidden type="file" accept="image/png,image/jpeg,image/jpg" onChange={uploadPhoto} />
            </Button>
          </Stack>
        </Paper>
      )}
      <Paper sx={{ p: 1.5, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={1}>
          <Tabs value={active.name} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
            {grouped.map((group) => <Tab key={group.name} value={group.name} label={group.name} />)}
          </Tabs>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={load} disabled={loading}>Refresh</Button>
            <Button variant="contained" startIcon={<Save />} onClick={save} disabled={saving || !consentGiven}>{saving ? "Saving..." : "Save"}</Button>
          </Stack>
        </Stack>
      </Paper>
      {loading && <Alert severity="info" sx={{ mb: 2 }}>Loading profile...</Alert>}
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {active.fields.map((field) => (
            <Grid item xs={12} md={field.type === "textarea" ? 12 : 4} key={field.field}>
              <FieldControl field={field} value={values[field.field]} disabled={!consentGiven} onChange={(name, value) => setValues((old) => ({ ...old, [name]: value }))} />
              {!consentGiven && <Typography variant="caption" color="warning.main">Consent required</Typography>}
              {consentGiven && pendingValues[field.field] && (
                <Typography variant="caption" color="warning.main" display="block">
                  Pending approval value loaded{pendingValues[field.field].level ? ` at level ${pendingValues[field.field].level}` : ""}
                </Typography>
              )}
              {consentGiven && !isEditable(field) && <Typography variant="caption" color="text.secondary">Read only</Typography>}
            </Grid>
          ))}
          {!active.fields.length && <Grid item xs={12}><Alert severity="info">No profile fields configured for this role.</Alert></Grid>}
        </Grid>
      </Paper>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>My profile edit approval status</Typography>
        {!approvalStatus.length && <Alert severity="info">No profile edit requests submitted yet.</Alert>}
        {approvalStatus.map((request) => (
          <Box key={request._id} sx={{ mb: 1.5, border: "1px solid #e5e7eb", borderRadius: 1, p: 1.5 }}>
            <Typography fontWeight={800}>{new Date(request.createdAt).toLocaleString()} - {request.status}</Typography>
            {(request.fields || []).map((field) => (
              <Typography key={`${request._id}-${field.field}`} variant="body2">
                {field.label || field.field}: {String(field.oldvalue ?? "")} to {String(field.newvalue ?? "")} - {field.status}{field.comments ? ` (${field.comments})` : ""}
              </Typography>
            ))}
          </Box>
        ))}
      </Paper>
      {student && (
        <>
          <Paper sx={{ p: 1, mt: 2, borderRadius: 2, overflowX: "auto" }}>
            <Typography variant="h6" fontWeight={800} sx={{ p: 1 }}>Required documents</Typography>
            <DataGrid
              rows={documentRequirements}
              columns={requirementColumns}
              getRowId={(row) => row._id}
              loading={loading}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "required_documents" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              sx={{ minWidth: 1450 }}
            />
          </Paper>

          <Paper sx={{ p: 1, mt: 2, borderRadius: 2, overflowX: "auto" }}>
            <Typography variant="h6" fontWeight={800} sx={{ p: 1 }}>Uploaded document history</Typography>
            <DataGrid
              rows={documentUploads}
              columns={uploadColumns}
              getRowId={(row) => row._id}
              loading={loading}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "uploaded_documents" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              sx={{ minWidth: 1200 }}
            />
          </Paper>

          <Paper sx={{ p: 2, mt: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>My document approval status</Typography>
            {!documentApprovalStatus.length && <Alert severity="info">No document approval requests submitted yet.</Alert>}
            {documentApprovalStatus.map((item) => (
              <Box key={item._id} sx={{ mb: 1.5, border: "1px solid #e5e7eb", borderRadius: 1, p: 1.5 }}>
                <Typography fontWeight={800}>{item.documentname} - {item.status}</Typography>
                <Typography variant="body2">Uploaded: {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</Typography>
                {item.url && <Link href={item.url} target="_blank" rel="noreferrer">{item.originalname || "Open document"}</Link>}
                {item.comments && <Typography variant="body2">Comments: {item.comments}</Typography>}
              </Box>
            ))}
          </Paper>
        </>
      )}
    </Box>
  );
}

export default function UserProfileEditPage({ student = false }) {
  return (
    <MenuPageShell title={student ? "My profile" : "Profile edit"} menuType={student ? "student" : undefined}>
      <ProfileBody student={student} />
    </MenuPageShell>
  );
}
