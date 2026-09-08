import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import FolderIcon from "@mui/icons-material/Folder";
import GridViewIcon from "@mui/icons-material/GridView";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RefreshIcon from "@mui/icons-material/Refresh";
import TableRowsIcon from "@mui/icons-material/TableRows";
import ep1 from "../api/ep1";
import global1 from "./global1";

const formatSize = (size = 0) => {
  const value = Number(size || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const encodePath = (key) => String(key || "").split("/").map(encodeURIComponent).join("/");

const s3Host = (bucket, region) => region === "us-east-1"
  ? `${bucket}.s3.amazonaws.com`
  : `${bucket}.s3.${region}.amazonaws.com`;

const fileUrl = (bucket, region, key) => `https://${s3Host(bucket, region)}/${encodePath(key)}`;

const hmac = (key, value) => CryptoJS.HmacSHA256(value, key);
const sha256Hex = (value) => CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
const arrayBufferToWordArray = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const words = [];
  for (let i = 0; i < bytes.length; i += 1) {
    words[i >>> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length);
};
const fileIcon = (item) => {
  const name = String(item.name || item.key || "").toLowerCase();
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(name)) return <ImageIcon sx={{ fontSize: 42, color: "#1a73e8" }} />;
  if (name.endsWith(".pdf")) return <PictureAsPdfIcon sx={{ fontSize: 42, color: "#d93025" }} />;
  return <InsertDriveFileIcon sx={{ fontSize: 42, color: "#5f6368" }} />;
};

const signingKey = (secret, dateStamp, region) => {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, "s3");
  return hmac(kService, "aws4_request");
};

const signedS3Request = async ({ method, config, key = "", query = "", body = "", contentType = "", extraHeaders = {} }) => {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = config.region;
  const host = s3Host(config.bucket, region);
  const canonicalUri = key ? `/${encodePath(key)}` : "/";
  const payloadHash = body ? CryptoJS.SHA256(arrayBufferToWordArray(body)).toString(CryptoJS.enc.Hex) : sha256Hex("");
  const headers = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    ...extraHeaders
  };
  if (contentType) headers["content-type"] = contentType;

  const sortedHeaderKeys = Object.keys(headers).map((item) => item.toLowerCase()).sort();
  const lowerHeaders = Object.fromEntries(Object.entries(headers).map(([header, value]) => [header.toLowerCase(), value]));
  const canonicalHeaders = sortedHeaderKeys.map((header) => `${header}:${String(lowerHeaders[header]).trim()}\n`).join("");
  const signedHeaders = sortedHeaderKeys.join(";");
  const canonicalRequest = [method, canonicalUri, query, canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256Hex(canonicalRequest)].join("\n");
  const signature = hmac(signingKey(config.password, dateStamp, region), stringToSign).toString(CryptoJS.enc.Hex);
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.username}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const url = `https://${host}${canonicalUri}${query ? `?${query}` : ""}`;

  const fetchHeaders = { ...headers, Authorization: authorization };
  delete fetchHeaders.host;

  const response = await fetch(url, {
    method,
    headers: fetchHeaders,
    body: method === "GET" || method === "DELETE" ? undefined : body
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `AWS request failed with status ${response.status}`);
  }
  return response;
};

const parseS3List = (xmlText, config) => {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  return Array.from(doc.getElementsByTagName("Contents")).map((node) => {
    const key = node.getElementsByTagName("Key")[0]?.textContent || "";
    const size = node.getElementsByTagName("Size")[0]?.textContent || "0";
    const lastModified = node.getElementsByTagName("LastModified")[0]?.textContent || "";
    const name = key.split("/").pop();
    return {
      id: key,
      key,
      name,
      size: Number(size),
      lastModified,
      url: fileUrl(config.bucket, config.region, key)
    };
  });
};

export default function AwsDocumentsPage() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [folder, setFolder] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedConfig = useMemo(() => configs.find((item) => item._id === selectedConfigId), [configs, selectedConfigId]);

  useEffect(() => {
    loadConfigs();
  }, []);

  useEffect(() => {
    if (selectedConfig) listDocuments();
  }, [selectedConfigId]);

  const loadConfigs = async () => {
    try {
      const res = await ep1.get("/api/v2/aws-config", { params: { colid: global1.colid } });
      const list = res.data || [];
      setConfigs(list);
      const defaultConfig = list.find((item) => item.default === "Yes") || list.find((item) => String(item.type || "").toLowerCase() === "aws") || list[0];
      if (defaultConfig) setSelectedConfigId(defaultConfig._id);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load AWS configurations");
    }
  };

  const listDocuments = async () => {
    if (!selectedConfig) return;
    try {
      setLoading(true);
      setError("");
      const prefix = `${global1.colid}/${folder ? `${folder.replace(/^\/+|\/+$/g, "")}/` : ""}`;
      const query = `list-type=2&prefix=${encodeURIComponent(prefix)}`;
      const response = await signedS3Request({ method: "GET", config: selectedConfig, query });
      const xml = await response.text();
      setDocuments(parseS3List(xml, selectedConfig));
    } catch (err) {
      setError(err.message || "Unable to list AWS documents. Check bucket CORS and permissions.");
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async () => {
    if (!selectedConfig) return setError("Select AWS configuration");
    if (!file) return setError("Select a file");

    try {
      setUploading(true);
      setError("");
      setMessage("");
      const cleanFolder = folder.trim().replace(/^\/+|\/+$/g, "");
      const cleanName = file.name.replace(/[^\w.\-() ]/g, "_");
      const descriptionPart = description ? `${description.trim().replace(/[^\w.\-() ]/g, "_")}-` : "";
      const key = `${global1.colid}/${cleanFolder ? `${cleanFolder}/` : ""}${Date.now()}-${descriptionPart}${cleanName}`;
      const buffer = await file.arrayBuffer();

      await signedS3Request({
        method: "PUT",
        config: selectedConfig,
        key,
        body: buffer,
        contentType: file.type || "application/octet-stream",
        extraHeaders: { "x-amz-acl": "public-read" }
      });

      setMessage("File uploaded successfully");
      setFile(null);
      setDescription("");
      const input = document.getElementById("aws-documents-file-input");
      if (input) input.value = "";
      listDocuments();
    } catch (err) {
      setError(err.message || "Unable to upload file from browser. Check bucket CORS and permissions.");
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (row) => {
    if (!selectedConfig || !window.confirm("Delete this document from AWS?")) return;
    try {
      await signedS3Request({ method: "DELETE", config: selectedConfig, key: row.key });
      setMessage("Document deleted");
      listDocuments();
    } catch (err) {
      setError(err.message || "Unable to delete document");
    }
  };

  const columns = [
    { field: "name", headerName: "Name", width: 280 },
    { field: "key", headerName: "S3 Key", width: 360 },
    { field: "size", headerName: "Size", width: 110, valueFormatter: (params) => formatSize(params.value) },
    { field: "lastModified", headerName: "Last Modified", width: 190 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<DownloadIcon />} label="Open" onClick={() => window.open(params.row.url, "_blank", "noopener,noreferrer")} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteDocument(params.row)} />
      ]
    }
  ];

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>AWS Documents</Typography>
          <Typography variant="body2" color="text.secondary">Upload and browse S3 files directly from the browser.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="AWS Configuration" value={selectedConfigId} onChange={(event) => setSelectedConfigId(event.target.value)}>
              {configs.map((item) => <MenuItem key={item._id} value={item._id}>{item.name || item.bucket} ({item.bucket})</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Folder" value={folder} onChange={(event) => setFolder(event.target.value)} onBlur={listDocuments} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button component="label" fullWidth variant="outlined" startIcon={<FolderIcon />} sx={{ height: 56 }}>
              Select File
              <input id="aws-documents-file-input" hidden type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" startIcon={<CloudUploadIcon />} onClick={uploadDocument} disabled={uploading} sx={{ height: 56 }}>
              {uploading ? "Uploading" : "Upload"}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "flex-start", md: "center" }}>
              {file && <Chip label={`${file.name} - ${formatSize(file.size)}`} />}
              {selectedConfig && <Typography variant="body2" color="text.secondary">Bucket: {selectedConfig.bucket} | Region: {selectedConfig.region}</Typography>}
              <Button size="small" startIcon={<RefreshIcon />} onClick={listDocuments}>Refresh</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6">Documents</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Grid view"><IconButton color={viewMode === "grid" ? "primary" : "default"} onClick={() => setViewMode("grid")}><GridViewIcon /></IconButton></Tooltip>
          <Tooltip title="List view"><IconButton color={viewMode === "list" ? "primary" : "default"} onClick={() => setViewMode("list")}><TableRowsIcon /></IconButton></Tooltip>
        </Stack>
      </Stack>

      {viewMode === "grid" ? (
        <Grid container spacing={2}>
          {documents.map((item) => (
            <Grid item xs={12} sm={6} md={3} lg={2.4} key={item.key}>
              <Paper
                variant="outlined"
                sx={{ p: 1.5, height: 190, display: "flex", flexDirection: "column", justifyContent: "space-between", borderRadius: 2, cursor: "pointer", "&:hover": { boxShadow: 3, borderColor: "primary.main" } }}
                onDoubleClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
              >
                <Stack spacing={1}>
                  <Box sx={{ height: 58, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f8fafd", borderRadius: 1 }}>
                    {fileIcon(item)}
                  </Box>
                  <Typography fontWeight={700} fontSize={14} sx={{ wordBreak: "break-word" }}>{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatSize(item.size)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                  <Tooltip title="Open"><IconButton size="small" onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}><DownloadIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteDocument(item)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </Stack>
              </Paper>
            </Grid>
          ))}
          {!loading && documents.length === 0 && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">No documents found in this folder.</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={documents}
            getRowId={(row) => row.key}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "aws_documents" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1100 }}
          />
        </Paper>
      )}
    </Box>
  );
}
