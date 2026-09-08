import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function UserDocumentUploadPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [files, setFiles] = useState({});
  const [descriptions, setDescriptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [approvalStatus, setApprovalStatus] = useState([]);

  useEffect(() => {
    loadCurrentRole();
  }, []);

  useEffect(() => {
    loadData();
  }, [role]);

  const loadCurrentRole = async () => {
    try {
      if (global1.role) {
        setRole(global1.role);
        return;
      }
      const currentRoleRes = await ep1.get("/api/v2/user-documents/current-role", {
        params: { colid: global1.colid, user: global1.user }
      });
      setRole(currentRoleRes.data?.role || "");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load role");
    }
  };

  const loadData = async () => {
    if (!role) return;
    try {
      setLoading(true);
      const [reqRes, uploadRes] = await Promise.all([
        ep1.get("/api/v2/user-document-requirements", { params: { colid: global1.colid, role, status: "Active" } }),
        ep1.get("/api/v2/user-uploaded-documents", { params: { colid: global1.colid, role, owneruser: global1.user } })
      ]);
      setRequirements(reqRes.data || []);
      setUploads(uploadRes.data || []);
      const statusRes = await ep1.get("/api/v2/user-profile-approval-status", { params: { colid: global1.colid, owneruser: global1.user } });
      setApprovalStatus(statusRes.data.documents || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load documents");
    } finally {
      setLoading(false);
    }
  };

  const uploadMap = useMemo(() => {
    const map = {};
    uploads.forEach((item) => {
      map[item.documentname] = item;
    });
    return map;
  }, [uploads]);

  const uploadDocument = async (doc) => {
    const file = files[doc._id];
    if (!file) {
      setError("Please select a file");
      return;
    }
    try {
      setUploadingId(doc._id);
      setError("");
      setMessage("");
      const payload = new FormData();
      payload.append("file", file);
      payload.append("colid", global1.colid);
      payload.append("role", role);
      payload.append("documentrequirementid", doc._id);
      payload.append("documentname", doc.documentname);
      payload.append("description", descriptions[doc._id] || doc.description || "");
      payload.append("owneruser", global1.user || "");
      payload.append("ownername", global1.name || "");
      payload.append("uploadedby", global1.user || "");
      await ep1.post("/api/v2/user-uploaded-documents/upload", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFiles((prev) => ({ ...prev, [doc._id]: null }));
      setDescriptions((prev) => ({ ...prev, [doc._id]: "" }));
      setMessage(`${doc.documentname} uploaded and submitted for approval`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload document");
    } finally {
      setUploadingId("");
    }
  };

  const deleteUpload = async (row) => {
    if (!window.confirm("Delete this uploaded document record?")) return;
    try {
      setError("");
      setMessage("");
      await ep1.post("/api/v2/user-uploaded-documents-delete", { id: row._id, colid: global1.colid });
      setMessage("Uploaded document deleted");
      loadData();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete uploaded document");
    }
  };

  const requirementColumns = [
    { field: "documentname", headerName: "Document", width: 220 },
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
            <input hidden type="file" onChange={(e) => setFiles((prev) => ({ ...prev, [params.row._id]: e.target.files?.[0] || null }))} />
          </Button>
          <Typography variant="caption" noWrap sx={{ width: 130 }}>
            {files[params.row._id]?.name || "No file"}
          </Typography>
          <TextField
            size="small"
            label="Description"
            value={descriptions[params.row._id] || ""}
            onKeyDown={(e) => e.stopPropagation()}
            onChange={(e) => setDescriptions((prev) => ({ ...prev, [params.row._id]: e.target.value }))}
          />
          <Button
            size="small"
            variant="contained"
            startIcon={<UploadFileIcon />}
            disabled={uploadingId === params.row._id}
            onClick={() => uploadDocument(params.row)}
          >
            {uploadingId === params.row._id ? "Uploading..." : "Upload"}
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

  return (
    <MenuPageShell title="My Documents">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Breadcrumbs sx={{ mb: 1 }}>
                <RouterLink to="/dashdashfacnew" style={{ color: "inherit", textDecoration: "none" }}>Dashboard</RouterLink>
                <Typography color="text.primary">User management</Typography>
                <Typography color="text.primary">Upload documents</Typography>
              </Breadcrumbs>
              <Typography variant="h4" fontWeight={800}>Upload Documents</Typography>
              <Typography color="text.secondary">View documents required for your role and upload the files to AWS.</Typography>
            </Box>
            <Button variant="outlined" color="inherit" startIcon={<LogoutIcon />} onClick={() => navigate("/")}>Logout</Button>
          </Stack>

          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {(loading || uploadingId) && <LinearProgress />}

          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={9}>
                <Typography color="text.secondary">
                  User: <strong>{global1.name || global1.user}</strong> | Email: <strong>{global1.user || "NA"}</strong> | Role: <strong>{role || "Not found"}</strong>
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 1, borderRadius: 2, overflowX: "auto" }}>
            <Typography variant="h6" fontWeight={800} sx={{ p: 1 }}>Required documents</Typography>
            <DataGrid
              rows={requirements}
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

          <Paper sx={{ p: 1, borderRadius: 2, overflowX: "auto" }}>
            <Typography variant="h6" fontWeight={800} sx={{ p: 1 }}>Uploaded document history</Typography>
            <DataGrid
              rows={uploads}
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

          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>My document approval status</Typography>
            {!approvalStatus.length && <Alert severity="info">No document approval requests submitted yet.</Alert>}
            {approvalStatus.map((item) => (
              <Box key={item._id} sx={{ mb: 1.5, border: "1px solid #e5e7eb", borderRadius: 1, p: 1.5 }}>
                <Typography fontWeight={800}>{item.documentname} - {item.status}</Typography>
                <Typography variant="body2">Uploaded: {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</Typography>
                {item.url && <Link href={item.url} target="_blank" rel="noreferrer">{item.originalname || "Open document"}</Link>}
                {item.comments && <Typography variant="body2">Comments: {item.comments}</Typography>}
              </Box>
            ))}
          </Paper>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}
