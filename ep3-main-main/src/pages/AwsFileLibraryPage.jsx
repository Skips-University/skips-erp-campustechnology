import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const fileIcon = (mimetype = "", filename = "") => {
  const ext = filename.toLowerCase();
  if (mimetype.startsWith("image/")) return <ImageIcon sx={{ fontSize: 42, color: "#1a73e8" }} />;
  if (mimetype === "application/pdf" || ext.endsWith(".pdf")) return <PictureAsPdfIcon sx={{ fontSize: 42, color: "#d93025" }} />;
  return <InsertDriveFileIcon sx={{ fontSize: 42, color: "#5f6368" }} />;
};

export default function AwsFileLibraryPage() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [rows, setRows] = useState([]);
  const [awsconfigid, setAwsconfigid] = useState("");
  const [folder, setFolder] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadConfigs();
    loadFiles();
  }, []);

  const selectedConfig = useMemo(() => configs.find((item) => item._id === awsconfigid), [configs, awsconfigid]);

  const loadConfigs = async () => {
    try {
      const res = await ep1.get("/api/v2/aws-file-library/configs", { params: { colid: global1.colid } });
      const list = res.data || [];
      setConfigs(list);
      const defaultConfig = list.find((item) => item.default === "Yes") || list.find((item) => String(item.type || "").toLowerCase() === "aws") || list[0];
      if (defaultConfig) setAwsconfigid(defaultConfig._id);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load AWS configurations");
    }
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/aws-file-library/files", { params: { colid: global1.colid } });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load uploaded files");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async () => {
    try {
      if (!file) {
        setError("Select a file to upload");
        return;
      }
      if (!awsconfigid) {
        setError("Select AWS configuration");
        return;
      }

      setUploading(true);
      setError("");
      setMessage("");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("colid", global1.colid);
      formData.append("user", global1.user || "");
      formData.append("awsconfigid", awsconfigid);
      formData.append("folder", folder || "");
      formData.append("description", description || "");

      await ep1.post("/api/v2/aws-file-library/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage("File uploaded successfully");
      setFile(null);
      setDescription("");
      const input = document.getElementById("aws-file-library-input");
      if (input) input.value = "";
      loadFiles();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload file");
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (row) => {
    if (!window.confirm("Delete this file from AWS and library?")) return;
    try {
      await ep1.post("/api/v2/aws-file-library/delete", { id: row._id, colid: global1.colid });
      setMessage("File deleted");
      loadFiles();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete file");
    }
  };

  const openFile = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 260,
      valueGetter: (params) => params.row.originalname || params.row.filename || ""
    },
    { field: "folder", headerName: "Folder", width: 150 },
    { field: "mimetype", headerName: "Type", width: 180 },
    {
      field: "size",
      headerName: "Size",
      width: 110,
      valueFormatter: (params) => formatSize(params.value)
    },
    { field: "configname", headerName: "AWS Config", width: 150 },
    { field: "bucket", headerName: "Bucket", width: 160 },
    {
      field: "createdAt",
      headerName: "Uploaded",
      width: 170,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : ""
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<DownloadIcon />} label="Open" onClick={() => openFile(params.row.url)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteFile(params.row)} />
      ]
    }
  ];

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>AWS File Library</Typography>
          <Typography variant="body2" color="text.secondary">Upload files to the configured AWS bucket and browse them like a document library.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="AWS Configuration" value={awsconfigid} onChange={(event) => setAwsconfigid(event.target.value)}>
              {configs.map((item) => (
                <MenuItem key={item._id} value={item._id}>
                  {item.name || item.bucket} ({item.bucket})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Folder" value={folder} onChange={(event) => setFolder(event.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button component="label" fullWidth variant="outlined" startIcon={<FolderIcon />} sx={{ height: 56 }}>
              Select File
              <input id="aws-file-library-input" hidden type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" startIcon={<CloudUploadIcon />} onClick={uploadFile} disabled={uploading} sx={{ height: 56 }}>
              {uploading ? "Uploading" : "Upload"}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "flex-start", md: "center" }}>
              {file && <Chip label={`${file.name} - ${formatSize(file.size)}`} />}
              {selectedConfig && <Typography variant="body2" color="text.secondary">Bucket: {selectedConfig.bucket} | Region: {selectedConfig.region}</Typography>}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6">Files</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Grid view">
            <IconButton color={viewMode === "grid" ? "primary" : "default"} onClick={() => setViewMode("grid")}>
              <GridViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="List view">
            <IconButton color={viewMode === "list" ? "primary" : "default"} onClick={() => setViewMode("list")}>
              <TableRowsIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {viewMode === "grid" ? (
        <Grid container spacing={2}>
          {rows.map((row) => (
            <Grid item xs={12} sm={6} md={3} lg={2.4} key={row._id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  height: 190,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  borderRadius: 2,
                  "&:hover": { boxShadow: 3, borderColor: "primary.main" }
                }}
                onDoubleClick={() => openFile(row.url)}
              >
                <Stack spacing={1}>
                  <Box sx={{ height: 58, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f8fafd", borderRadius: 1 }}>
                    {fileIcon(row.mimetype, row.originalname)}
                  </Box>
                  <Typography fontWeight={700} fontSize={14} sx={{ wordBreak: "break-word" }} title={row.originalname || row.filename}>
                    {row.originalname || row.filename}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{formatSize(row.size)}</Typography>
                  {row.folder && <Chip size="small" label={row.folder} sx={{ alignSelf: "flex-start" }} />}
                </Stack>
                <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                  <Tooltip title="Open">
                    <IconButton size="small" onClick={() => openFile(row.url)}><DownloadIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => deleteFile(row)}><DeleteIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Stack>
              </Paper>
            </Grid>
          ))}
          {!loading && rows.length === 0 && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">No files uploaded yet.</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={rows}
            getRowId={(row) => row._id}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "aws_file_library" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1350 }}
          />
        </Paper>
      )}
    </Box>
  );
}
