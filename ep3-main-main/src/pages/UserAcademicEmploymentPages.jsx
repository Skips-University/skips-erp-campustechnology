import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const modeOptions = ["Regular", "Distance", "Part-Time"];
const employmentTypes = ["Full time", "Part time", "Full time Hybrid", "Part time Hybrid", "Contractual", "Temporary", "Internship"];
const detailTypes = ["Academic Details", "Employment Details"];

const blankAcademic = {
  qualification: "",
  specialization: "",
  universityboard: "",
  institutecollege: "",
  passingyear: "",
  percentagecgpa: "",
  modeofstudy: "Regular",
  status: "Active"
};

const blankEmployment = {
  organizationname: "",
  designation: "",
  employmenttype: "Full time",
  dateofjoining: "",
  lastworkingdate: "",
  totalexperience: "",
  lastdrawnsalary: "",
  reasonforleaving: "",
  status: "Active"
};

const blankRequirement = {
  role: "",
  type: "Academic Details",
  documentname: "",
  description: "",
  mandatory: "Yes",
  order: 0,
  status: "Active"
};

const getMessage = (err, fallback) => err.response?.data?.message || err.response?.data?.msg || fallback;
const csvExport = (rows, filename) => {
  if (!rows?.length) return;
  const fields = Object.keys(rows[0]).filter((field) => !field.startsWith("_") && field !== "documents");
  const csv = [fields.join(","), ...rows.map((row) => fields.map((field) => `"${String(row[field] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

function DocumentLinks({ documents = [] }) {
  if (!documents.length) return <Typography variant="caption" color="text.secondary">No documents</Typography>;
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ py: 0.5 }}>
      {documents.map((doc) => (
        <Link key={`${doc.documentname}-${doc.url}`} href={doc.url} target="_blank" rel="noreferrer">
          {doc.documentname || doc.originalname || doc.filename || "Open"}
        </Link>
      ))}
    </Stack>
  );
}

function DocumentUploadPanel({ type, role, record, onUploaded }) {
  const [requirements, setRequirements] = useState([]);
  const [files, setFiles] = useState({});
  const [descriptions, setDescriptions] = useState({});
  const [customDoc, setCustomDoc] = useState({ documentname: "", description: "", file: null });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState("");

  useEffect(() => {
    loadRequirements();
  }, [type, role]);

  const loadRequirements = async () => {
    if (!role) return;
    try {
      const res = await ep1.get("/api/v2/user-profile-detail-requirements", {
        params: { colid: global1.colid, role, type, status: "Active" }
      });
      setRequirements(res.data?.data || []);
    } catch (err) {
      setError(getMessage(err, "Unable to load document requirements"));
    }
  };

  const existingDocs = useMemo(() => {
    const map = {};
    (record?.documents || []).forEach((doc) => { map[doc.documentname] = doc; });
    return map;
  }, [record]);

  const upload = async (doc) => {
    if (!record?._id) {
      setError("Save the record before uploading documents.");
      return;
    }
    if (!files[doc._id]) {
      setError("Please select a file.");
      return;
    }
    try {
      setUploading(doc._id);
      setError("");
      setMessage("");
      const payload = new FormData();
      payload.append("file", files[doc._id]);
      payload.append("colid", global1.colid);
      payload.append("id", record._id);
      payload.append("detailtype", type);
      payload.append("documentname", doc.documentname);
      payload.append("description", descriptions[doc._id] || doc.description || "");
      payload.append("uploadedby", global1.user || "");
      await ep1.post("/api/v2/user-profile-detail-document-upload", payload, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage("Document uploaded.");
      setFiles((prev) => ({ ...prev, [doc._id]: null }));
      onUploaded?.();
    } catch (err) {
      setError(getMessage(err, "Unable to upload document"));
    } finally {
      setUploading("");
    }
  };

  const uploadCustom = async () => {
    if (!record?._id) return setError("Save or select an entry before uploading documents.");
    if (!customDoc.documentname.trim()) return setError("Document name is required.");
    if (!customDoc.file) return setError("Please select a file.");
    try {
      setUploading("custom");
      setError("");
      setMessage("");
      const payload = new FormData();
      payload.append("file", customDoc.file);
      payload.append("colid", global1.colid);
      payload.append("id", record._id);
      payload.append("detailtype", type);
      payload.append("documentname", customDoc.documentname.trim());
      payload.append("description", customDoc.description || "");
      payload.append("uploadedby", global1.user || "");
      await ep1.post("/api/v2/user-profile-detail-document-upload", payload, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage("Document uploaded.");
      setCustomDoc({ documentname: "", description: "", file: null });
      onUploaded?.();
    } catch (err) {
      setError(getMessage(err, "Unable to upload document"));
    } finally {
      setUploading("");
    }
  };

  const columns = [
    { field: "documentname", headerName: "Document", minWidth: 220, flex: 1 },
    { field: "mandatory", headerName: "Mandatory", width: 120 },
    { field: "description", headerName: "Description", minWidth: 220, flex: 1 },
    {
      field: "current",
      headerName: "Current Link",
      minWidth: 220,
      renderCell: (params) => {
        const doc = existingDocs[params.row.documentname];
        return doc?.url ? <Link href={doc.url} target="_blank" rel="noreferrer">{doc.originalname || doc.filename || "Open"}</Link> : "Not uploaded";
      }
    },
    {
      field: "upload",
      headerName: "Upload",
      minWidth: 470,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
          <Button component="label" size="small" variant="outlined">
            File
            <input hidden type="file" onChange={(e) => setFiles((prev) => ({ ...prev, [params.row._id]: e.target.files?.[0] || null }))} />
          </Button>
          <Typography variant="caption" noWrap sx={{ width: 110 }}>{files[params.row._id]?.name || "No file"}</Typography>
          <TextField size="small" label="Description" value={descriptions[params.row._id] || ""} onKeyDown={(e) => e.stopPropagation()} onChange={(e) => setDescriptions((prev) => ({ ...prev, [params.row._id]: e.target.value }))} />
          <Button size="small" variant="contained" startIcon={<UploadFileIcon />} disabled={uploading === params.row._id} onClick={() => upload(params.row)}>
            {uploading === params.row._id ? "Uploading..." : "Upload"}
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
      <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>{type} Documents</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload documents for the selected entry: {record?.qualification || record?.organizationname || "Selected entry"}.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 1 }} onClose={() => setMessage("")}>{message}</Alert>}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Typography fontWeight={900} sx={{ mb: 1 }}>Add document to this entry</Typography>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Document name" value={customDoc.documentname} onChange={(e) => setCustomDoc({ ...customDoc, documentname: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="Description" value={customDoc.description} onChange={(e) => setCustomDoc({ ...customDoc, description: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button component="label" variant="outlined" size="small">
                Select file
                <input hidden type="file" onChange={(e) => setCustomDoc({ ...customDoc, file: e.target.files?.[0] || null })} />
              </Button>
              <Typography variant="caption" noWrap sx={{ maxWidth: 180 }}>{customDoc.file?.name || "No file selected"}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" startIcon={<UploadFileIcon />} disabled={uploading === "custom"} onClick={uploadCustom}>
              {uploading === "custom" ? "Uploading..." : "Upload"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {record?.documents?.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography fontWeight={900} sx={{ mb: 1 }}>Uploaded documents</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {record.documents.map((doc) => (
              <Link key={`${doc.documentname}-${doc.url}`} href={doc.url} target="_blank" rel="noreferrer" sx={{ mr: 1 }}>
                {doc.documentname || doc.originalname || doc.filename || "Open document"}
              </Link>
            ))}
          </Stack>
        </Paper>
      )}
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <DataGrid
          rows={requirements}
          columns={columns}
          getRowId={(row) => row._id}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1250 }}
        />
      </Box>
    </Paper>
  );
}

function DetailPage({ kind }) {
  const academic = kind === "academic";
  const type = academic ? "Academic Details" : "Employment Details";
  const blank = academic ? blankAcademic : blankEmployment;
  const listUrl = academic ? "/api/v2/user-academic-details" : "/api/v2/user-employment-details";
  const deleteUrl = academic ? "/api/v2/user-academic-details-delete" : "/api/v2/user-employment-details-delete";
  const [form, setForm] = useState(blank);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await ep1.get(listUrl, { params: { colid: global1.colid, owneruser: global1.user } });
      setRows(res.data?.data || []);
      if (selected?._id) {
        const fresh = (res.data?.data || []).find((row) => row._id === selected._id);
        if (fresh) setSelected(fresh);
      }
    } catch (err) {
      setError(getMessage(err, `Unable to load ${type.toLowerCase()}`));
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setError("");
      setMessage("");
      const payload = {
        ...form,
        id: form._id,
        colid: global1.colid,
        owneruser: global1.user,
        ownername: global1.name,
        role: global1.role,
        user: global1.user
      };
      const res = await ep1.post(listUrl, payload);
      setSelected(res.data?.data);
      setForm(blank);
      setMessage("Saved successfully.");
      load();
    } catch (err) {
      setError(getMessage(err, "Unable to save"));
    }
  };

  const edit = (row) => {
    setForm({ ...blank, ...row });
    setSelected(row);
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await ep1.post(deleteUrl, { id: row._id, colid: global1.colid });
      setMessage("Deleted.");
      if (selected?._id === row._id) setSelected(null);
      load();
    } catch (err) {
      setError(getMessage(err, "Unable to delete"));
    }
  };

  const columns = academic ? [
    { field: "qualification", headerName: "Qualification/Degree", minWidth: 190, flex: 1 },
    { field: "specialization", headerName: "Specialization", minWidth: 170 },
    { field: "universityboard", headerName: "University/Board", minWidth: 180 },
    { field: "institutecollege", headerName: "Institute/College", minWidth: 210 },
    { field: "passingyear", headerName: "Passing Year", minWidth: 130 },
    { field: "percentagecgpa", headerName: "Percentage/CGPA/Grade", minWidth: 190 },
    { field: "modeofstudy", headerName: "Mode", minWidth: 140 }
  ] : [
    { field: "organizationname", headerName: "Organization", minWidth: 210, flex: 1 },
    { field: "designation", headerName: "Designation", minWidth: 170 },
    { field: "employmenttype", headerName: "Employment Type", minWidth: 170 },
    { field: "dateofjoining", headerName: "Joining", minWidth: 130 },
    { field: "lastworkingdate", headerName: "Last Working", minWidth: 140 },
    { field: "totalexperience", headerName: "Experience", minWidth: 130 },
    { field: "lastdrawnsalary", headerName: "Last Salary", minWidth: 130 },
    { field: "reasonforleaving", headerName: "Reason", minWidth: 220 }
  ];
  const allColumns = [
    ...columns,
    {
      field: "documents",
      headerName: "Document Links",
      minWidth: 280,
      flex: 1,
      sortable: false,
      renderCell: (params) => <DocumentLinks documents={params.row.documents || []} />
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<EditIcon />} onClick={() => edit(params.row)}>Edit</Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => remove(params.row)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title={type}>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h4" fontWeight={950}>{type}</Typography>
                <Typography color="text.secondary">Add your {academic ? "academic qualifications" : "past employment history"} and upload required documents.</Typography>
              </Box>
              <Button startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>
            </Stack>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>{form._id ? "Edit Entry" : "New Entry"}</Typography>
            <Grid container spacing={2}>
              {academic ? (
                <>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Qualification/Degree" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="University/Board" value={form.universityboard} onChange={(e) => setForm({ ...form, universityboard: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Institute/College Name" value={form.institutecollege} onChange={(e) => setForm({ ...form, institutecollege: e.target.value })} /></Grid>
                  <Grid item xs={12} md={2}><TextField fullWidth label="Passing Year" value={form.passingyear} onChange={(e) => setForm({ ...form, passingyear: e.target.value })} /></Grid>
                  <Grid item xs={12} md={3}><TextField fullWidth label="Percentage/CGPA/Grade" value={form.percentagecgpa} onChange={(e) => setForm({ ...form, percentagecgpa: e.target.value })} /></Grid>
                  <Grid item xs={12} md={3}><TextField select fullWidth label="Mode of Study" value={form.modeofstudy} onChange={(e) => setForm({ ...form, modeofstudy: e.target.value })}>{modeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Organization Name" value={form.organizationname} onChange={(e) => setForm({ ...form, organizationname: e.target.value })} /></Grid>
                  <Grid item xs={12} md={3}><TextField fullWidth label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Grid>
                  <Grid item xs={12} md={3}><TextField select fullWidth label="Employment Type" value={form.employmenttype} onChange={(e) => setForm({ ...form, employmenttype: e.target.value })}>{employmentTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Date of Joining" InputLabelProps={{ shrink: true }} value={form.dateofjoining} onChange={(e) => setForm({ ...form, dateofjoining: e.target.value })} /></Grid>
                  <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Last Working Date" InputLabelProps={{ shrink: true }} value={form.lastworkingdate} onChange={(e) => setForm({ ...form, lastworkingdate: e.target.value })} /></Grid>
                  <Grid item xs={12} md={2}><TextField fullWidth label="Total Experience" value={form.totalexperience} onChange={(e) => setForm({ ...form, totalexperience: e.target.value })} /></Grid>
                  <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Last Drawn Salary" value={form.lastdrawnsalary} onChange={(e) => setForm({ ...form, lastdrawnsalary: e.target.value })} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth label="Reason for Leaving" value={form.reasonforleaving} onChange={(e) => setForm({ ...form, reasonforleaving: e.target.value })} /></Grid>
                </>
              )}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={save}>Save</Button>
                  <Button variant="outlined" onClick={() => { setForm(blank); setSelected(null); }}>Clear</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {selected && <DocumentUploadPanel type={type} role={global1.role} record={selected} onUploaded={load} />}

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", overflowX: "auto" }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={900}>Saved Entries</Typography>
              <Button onClick={() => csvExport(rows, `${academic ? "academic" : "employment"}_details.csv`)}>Export</Button>
            </Stack>
            <DataGrid
              rows={rows}
              columns={allColumns}
              getRowId={(row) => row._id}
              loading={loading}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              onRowClick={(params) => setSelected(params.row)}
              getRowHeight={() => "auto"}
              sx={{ minWidth: 1400 }}
            />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function UserAcademicDetailsPage() {
  return <DetailPage kind="academic" />;
}

export function UserEmploymentDetailsPage() {
  return <DetailPage kind="employment" />;
}

export function UserProfileDetailRequirementsPage() {
  const [form, setForm] = useState(blankRequirement);
  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => { load(); loadRoles(); }, []);

  const loadRoles = async () => {
    try {
      const res = await ep1.get("/api/v2/user-documents/roles", { params: { colid: global1.colid } });
      setRoles(res.data || []);
    } catch {
      setRoles(["Faculty", "Admin", "All"]);
    }
  };
  const load = async () => {
    try {
      const res = await ep1.get("/api/v2/user-profile-detail-requirements", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(getMessage(err, "Unable to load requirements"));
    }
  };
  const save = async () => {
    try {
      await ep1.post("/api/v2/user-profile-detail-requirements", { ...form, id: form._id, colid: global1.colid, user: global1.user });
      setForm(blankRequirement);
      setMessage("Saved.");
      load();
    } catch (err) {
      setError(getMessage(err, "Unable to save requirement"));
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this requirement?")) return;
    try {
      await ep1.post("/api/v2/user-profile-detail-requirements-delete", { id: row._id, colid: global1.colid });
      setMessage("Deleted.");
      load();
    } catch (err) {
      setError(getMessage(err, "Unable to delete"));
    }
  };
  const columns = [
    { field: "role", headerName: "Role", minWidth: 140 },
    { field: "type", headerName: "Type", minWidth: 170 },
    { field: "documentname", headerName: "Document", minWidth: 220, flex: 1 },
    { field: "mandatory", headerName: "Mandatory", minWidth: 120 },
    { field: "order", headerName: "Order", type: "number", minWidth: 100 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "description", headerName: "Description", minWidth: 240, flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<EditIcon />} onClick={() => setForm(params.row)}>Edit</Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => remove(params.row)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Profile Detail Documents">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Academic/Employment Document Requirements</Typography>
            <Typography color="text.secondary">Define rolewise documents for academic details and employment details.</Typography>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{detailTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Document Name" value={form.documentname} onChange={(e) => setForm({ ...form, documentname: e.target.value })} /></Grid>
              <Grid item xs={12} md={1.5}><TextField select fullWidth label="Mandatory" value={form.mandatory} onChange={(e) => setForm({ ...form, mandatory: e.target.value })}>{["Yes", "No"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={1}><TextField fullWidth type="number" label="Order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></Grid>
              <Grid item xs={12} md={1.5}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["Active", "Inactive"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={10}><TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: "100%" }} onClick={save}>Save</Button></Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", overflowX: "auto" }}>
            <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 1300 }} />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

function ProfileView({ mine = false }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mine) loadProfile(global1.user);
    else loadUsers();
  }, [mine]);

  const loadUsers = async (search = "") => {
    try {
      const res = await ep1.get("/api/v2/user-profile-details/users", { params: { colid: global1.colid, search } });
      setUsers(res.data?.data || []);
    } catch (err) {
      setError(getMessage(err, "Unable to load users"));
    }
  };
  const loadProfile = async (owneruser) => {
    try {
      const res = await ep1.get("/api/v2/user-profile-details/profile", {
        params: { colid: global1.colid, owneruser, emailonly: "Yes" }
      });
      setProfile(res.data || null);
    } catch (err) {
      setError(getMessage(err, "Unable to load profile"));
    }
  };
  const user = profile?.user || {};
  const customFields = user.customFields ? Object.entries(user.customFields) : [];
  const fieldRows = [
    ["Name", user.name],
    ["Email", user.email],
    ["Phone", user.phone],
    ["Role", user.role],
    ["Department", user.department],
    ["Designation", user.designation],
    ["Institution", user.institution],
    ["Program", user.program],
    ["Program Code", user.programcode],
    ["Academic Year", user.academicyear],
    ["Regulation", user.regulation],
    ["Semester", user.semester],
    ["Section", user.section]
  ].filter(([, value]) => value);

  const academicColumns = [
    { field: "qualification", headerName: "Qualification/Degree", minWidth: 190, flex: 1 },
    { field: "specialization", headerName: "Specialization", minWidth: 160 },
    { field: "universityboard", headerName: "University/Board", minWidth: 180 },
    { field: "institutecollege", headerName: "Institute/College", minWidth: 200 },
    { field: "passingyear", headerName: "Passing Year", minWidth: 130 },
    { field: "percentagecgpa", headerName: "Percentage/CGPA/Grade", minWidth: 180 },
    { field: "modeofstudy", headerName: "Mode", minWidth: 130 },
    { field: "documents", headerName: "Documents", minWidth: 280, flex: 1, sortable: false, renderCell: (params) => <DocumentLinks documents={params.row.documents || []} /> }
  ];
  const employmentColumns = [
    { field: "organizationname", headerName: "Organization", minWidth: 210, flex: 1 },
    { field: "designation", headerName: "Designation", minWidth: 160 },
    { field: "employmenttype", headerName: "Type", minWidth: 150 },
    { field: "dateofjoining", headerName: "Joining", minWidth: 120 },
    { field: "lastworkingdate", headerName: "Last Working", minWidth: 130 },
    { field: "totalexperience", headerName: "Experience", minWidth: 120 },
    { field: "lastdrawnsalary", headerName: "Salary", minWidth: 120 },
    { field: "reasonforleaving", headerName: "Reason", minWidth: 180 },
    { field: "documents", headerName: "Documents", minWidth: 280, flex: 1, sortable: false, renderCell: (params) => <DocumentLinks documents={params.row.documents || []} /> }
  ];

  return (
    <MenuPageShell title={mine ? "My Profile" : "Employee Profile"}>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>{mine ? "My Profile" : "Employee Profile"}</Typography>
            <Typography color="text.secondary">Profile, custom fields, academic details, employment history and uploaded document links.</Typography>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {!mine && (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
              <Autocomplete
                options={users}
                getOptionLabel={(option) => `${option.name || ""} - ${option.email || ""}`}
                value={selectedUser}
                onInputChange={(_, value) => loadUsers(value)}
                onChange={(_, value) => { setSelectedUser(value); if (value?.email) loadProfile(value.email); }}
                renderInput={(params) => <TextField {...params} label="Search employee" />}
              />
            </Paper>
          )}
          {profile && (
            <>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={2}>
                    <Avatar src={user.photo || ""} alt={user.name || "Profile"} sx={{ width: 150, height: 150, border: "4px solid #e5e7eb" }} />
                  </Grid>
                  <Grid item xs={12} md={10}>
                    <Typography variant="h5" fontWeight={950}>{user.name}</Typography>
                    <Typography color="text.secondary">{user.email} | {user.phone}</Typography>
                    <Grid container spacing={1.2} sx={{ mt: 1 }}>
                      {fieldRows.map(([label, value]) => (
                        <Grid item xs={12} sm={6} md={4} key={label}>
                          <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ py: 1.2 }}>
                              <Typography variant="caption" color="text.secondary">{label}</Typography>
                              <Typography fontWeight={800}>{String(value)}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                      {customFields.map(([label, value]) => value ? (
                        <Grid item xs={12} sm={6} md={4} key={label}>
                          <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ py: 1.2 }}>
                              <Typography variant="caption" color="text.secondary">{label}</Typography>
                              <Typography fontWeight={800}>{String(value)}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ) : null)}
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", overflowX: "auto" }}>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>Academic Details</Typography>
                <DataGrid rows={profile.academic || []} columns={academicColumns} getRowId={(row) => row._id} autoHeight getRowHeight={() => "auto"} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} sx={{ minWidth: 1400 }} />
              </Paper>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", overflowX: "auto" }}>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>Employment Details</Typography>
                <DataGrid rows={profile.employment || []} columns={employmentColumns} getRowId={(row) => row._id} autoHeight getRowHeight={() => "auto"} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} sx={{ minWidth: 1500 }} />
              </Paper>
            </>
          )}
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function UserProfileFullPage() {
  return <ProfileView />;
}

export function MyProfileFullPage() {
  return <ProfileView mine />;
}

export function UserAcademicEmploymentAdminPage() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [academic, setAcademic] = useState([]);
  const [employment, setEmployment] = useState([]);

  useEffect(() => { loadUsers(); }, []);
  const loadUsers = async (search = "") => {
    const res = await ep1.get("/api/v2/user-profile-details/users", { params: { colid: global1.colid, search } });
    setUsers(res.data?.data || []);
  };
  const loadDetails = async (user) => {
    if (!user?.email) return;
    const [a, e] = await Promise.all([
      ep1.get("/api/v2/user-academic-details", { params: { colid: global1.colid, owneruser: user.email } }),
      ep1.get("/api/v2/user-employment-details", { params: { colid: global1.colid, owneruser: user.email } })
    ]);
    setAcademic(a.data?.data || []);
    setEmployment(e.data?.data || []);
  };
  const common = [
    { field: "ownername", headerName: "Employee", minWidth: 180 },
    { field: "owneruser", headerName: "Email", minWidth: 220 },
    { field: "role", headerName: "Role", minWidth: 120 }
  ];
  const docsColumn = { field: "documents", headerName: "Documents", minWidth: 280, flex: 1, sortable: false, renderCell: (params) => <DocumentLinks documents={params.row.documents || []} /> };
  const academicColumns = [...common, { field: "qualification", headerName: "Qualification", minWidth: 180 }, { field: "specialization", headerName: "Specialization", minWidth: 160 }, { field: "universityboard", headerName: "University/Board", minWidth: 180 }, { field: "passingyear", headerName: "Passing Year", minWidth: 130 }, { field: "percentagecgpa", headerName: "Marks/Grade", minWidth: 150 }, docsColumn];
  const employmentColumns = [...common, { field: "organizationname", headerName: "Organization", minWidth: 200 }, { field: "designation", headerName: "Designation", minWidth: 160 }, { field: "employmenttype", headerName: "Type", minWidth: 150 }, { field: "dateofjoining", headerName: "Joining", minWidth: 120 }, { field: "lastworkingdate", headerName: "Last Working", minWidth: 130 }, { field: "totalexperience", headerName: "Experience", minWidth: 130 }, docsColumn];

  return (
    <MenuPageShell title="Academic Employment Admin">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Academic & Employment Admin</Typography>
            <Typography color="text.secondary">Select an employee and review academic and employment records.</Typography>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.name || ""} - ${option.email || ""}`}
              value={selectedUser}
              onInputChange={(_, value) => loadUsers(value)}
              onChange={(_, value) => { setSelectedUser(value); loadDetails(value); }}
              renderInput={(params) => <TextField {...params} label="Search employee" />}
            />
          </Paper>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", overflowX: "auto" }}>
            <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
              <Tab label="Academic Details" />
              <Tab label="Employment Details" />
            </Tabs>
            <DataGrid rows={tab === 0 ? academic : employment} columns={tab === 0 ? academicColumns : employmentColumns} getRowId={(row) => row._id} autoHeight getRowHeight={() => "auto"} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} sx={{ minWidth: 1300 }} />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
