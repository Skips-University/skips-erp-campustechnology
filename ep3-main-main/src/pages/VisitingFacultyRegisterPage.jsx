import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Alert, Box, Button, Chip, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const payModes = ["hourly", "monthly", "lecturewise"];
const blankForm = { name: "", address: "", panno: "", profile: "", photolink: "", resumelink: "", documents: [], department: "", paymode: "lecturewise", amount: "", tds: "" };

export default function VisitingFacultyRegisterPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState("");
  const [filters, setFilters] = useState({ name: "", department: "", paymode: "", panno: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [docMeta, setDocMeta] = useState({ documenttype: "", description: "" });
  const [uploading, setUploading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadRows(); }, []);

  const loadRows = async (nextFilters = filters) => {
    try {
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/visitingfaculty/faculty", { params });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load visiting faculty.");
    }
  };

  const saveRow = async () => {
    if (!form.name || !form.paymode) {
      setError("Name and pay mode are required.");
      return;
    }
    try {
      setError("");
      await ep1.post("/api/v2/visitingfaculty/faculty", { ...form, id: editId, colid: global1.colid, user: global1.user });
      setMessage(editId ? "Visiting faculty updated." : "Visiting faculty added.");
      setForm(blankForm);
      setPhotoFile(null);
      setDocFile(null);
      setDocMeta({ documenttype: "", description: "" });
      setEditId("");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save visiting faculty.");
    }
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({ ...blankForm, ...row, documents: Array.isArray(row.documents) ? row.documents : [] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this visiting faculty?")) return;
    await ep1.post("/api/v2/visitingfaculty/faculty-delete", { id, colid: global1.colid });
    setMessage("Visiting faculty deleted.");
    loadRows();
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{ name: "Faculty Name", address: "Address", panno: "ABCDE1234F", profile: "Profile", photolink: "https://", resumelink: "https://", department: "Department", paymode: "lecturewise", amount: 1000, tds: 10 }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "VisitingFaculty");
    XLSX.writeFile(workbook, "visiting_faculty_template.xlsx");
  };

  const uploadToAws = async (file, folder, description) => {
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    data.append("user", global1.user || "");
    data.append("folder", folder);
    data.append("description", description || "");
    const res = await ep1.post("/api/v2/aws-file-library/upload", data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  };

  const uploadPhoto = async () => {
    if (!photoFile) {
      setError("Select a photo to upload.");
      return;
    }
    if (!photoFile.type?.startsWith("image/")) {
      setError("Photo must be an image file.");
      return;
    }
    try {
      setUploading("photo");
      setError("");
      const uploaded = await uploadToAws(photoFile, "visiting-faculty/photos", `${form.name || "Visiting faculty"} photo`);
      setForm((prev) => ({ ...prev, photolink: uploaded.url || "" }));
      setMessage("Photo uploaded.");
      setPhotoFile(null);
      const input = document.getElementById("visiting-faculty-photo-input");
      if (input) input.value = "";
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload photo.");
    } finally {
      setUploading("");
    }
  };

  const uploadDocument = async () => {
    if (!docFile) {
      setError("Select a document to upload.");
      return;
    }
    if (!docMeta.documenttype) {
      setError("Enter document type.");
      return;
    }
    try {
      setUploading("document");
      setError("");
      const uploaded = await uploadToAws(docFile, "visiting-faculty/documents", `${docMeta.documenttype} ${docMeta.description || ""}`.trim());
      const documentEntry = {
        documenttype: docMeta.documenttype,
        description: docMeta.description,
        link: uploaded.url || "",
        filename: uploaded.originalname || uploaded.filename || docFile.name,
        uploadedat: new Date().toISOString()
      };
      setForm((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), documentEntry],
        profile: `${prev.profile || ""}${prev.profile ? "\n" : ""}${docMeta.documenttype}: ${uploaded.url || ""}`
      }));
      setMessage("Document uploaded and added to profile.");
      setDocFile(null);
      setDocMeta({ documenttype: "", description: "" });
      const input = document.getElementById("visiting-faculty-doc-input");
      if (input) input.value = "";
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload document.");
    } finally {
      setUploading("");
    }
  };

  const removeDocument = (index) => {
    setForm((prev) => ({ ...prev, documents: (prev.documents || []).filter((item, itemIndex) => itemIndex !== index) }));
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const items = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({ rowNumber: index + 2, ...row }));
      const res = await ep1.post("/api/v2/visitingfaculty/faculty-bulk", { colid: global1.colid, user: global1.user, items });
      setMessage(`${res.data?.saved || 0} records uploaded.`);
      if (res.data?.errors?.length) setError(`${res.data.errors.length} rows could not be uploaded.`);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload visiting faculty.");
    }
  };

  const columns = useMemo(() => [
    { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "department", headerName: "Department", minWidth: 150, flex: 1 },
    { field: "panno", headerName: "PAN No", width: 140 },
    { field: "paymode", headerName: "Pay Mode", width: 130 },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "tds", headerName: "TDS %", width: 100, type: "number" },
    { field: "photolink", headerName: "Photo", minWidth: 150, flex: 1 },
    { field: "resumelink", headerName: "Resume Link", minWidth: 180, flex: 1 },
    { field: "actions", headerName: "Actions", width: 170, sortable: false, renderCell: (params) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => editRow(params.row)}>Edit</Button><Button size="small" color="error" onClick={() => deleteRow(params.row._id)}>Delete</Button></Stack> }
  ], []);

  return (
    <MenuPageShell title="Visiting Faculty">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box><Typography variant="h5" fontWeight={900}>Visiting Faculty</Typography><Typography color="text.secondary">Register visiting faculty and pay details.</Typography></Box>
            <Stack direction="row" spacing={1}><Button variant="outlined" onClick={downloadTemplate}>Template</Button><Button component="label" variant="contained" startIcon={<UploadFileIcon />}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} /></Button></Stack>
          </Stack>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="PAN No" value={form.panno} onChange={(e) => setForm({ ...form, panno: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Pay Mode" value={form.paymode} onChange={(e) => setForm({ ...form, paymode: e.target.value })}>{payModes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="TDS %" value={form.tds} onChange={(e) => setForm({ ...form, tds: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Resume Link" value={form.resumelink} onChange={(e) => setForm({ ...form, resumelink: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Photo Link" value={form.photolink} onChange={(e) => setForm({ ...form, photolink: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button fullWidth component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                  Select Photo
                  <input id="visiting-faculty-photo-input" hidden type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                </Button>
                <Button variant="contained" disabled={!photoFile || uploading === "photo"} onClick={uploadPhoto}>{uploading === "photo" ? "Uploading" : "Upload"}</Button>
              </Stack>
              {photoFile && <Typography variant="caption">{photoFile.name}</Typography>}
            </Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Profile" value={form.profile} onChange={(e) => setForm({ ...form, profile: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>Profile Documents</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}><TextField fullWidth label="Document Type" value={docMeta.documenttype} onChange={(e) => setDocMeta({ ...docMeta, documenttype: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Description" value={docMeta.description} onChange={(e) => setDocMeta({ ...docMeta, description: e.target.value })} /></Grid>
                  <Grid item xs={12} md={3}>
                    <Button fullWidth component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                      Select Document
                      <input id="visiting-faculty-doc-input" hidden type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
                    </Button>
                    {docFile && <Typography variant="caption">{docFile.name}</Typography>}
                  </Grid>
                  <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={!docFile || uploading === "document"} onClick={uploadDocument} sx={{ height: 56 }}>{uploading === "document" ? "Uploading" : "Upload"}</Button></Grid>
                </Grid>
                <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mt: 2 }}>
                  {(form.documents || []).map((doc, index) => (
                    <Chip
                      key={`${doc.link}-${index}`}
                      label={doc.documenttype || doc.filename || "Document"}
                      component="a"
                      href={doc.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      clickable
                      onDelete={() => removeDocument(index)}
                    />
                  ))}
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={saveRow} sx={{ height: 56 }}>{editId ? "Update" : "Save"}</Button></Grid>
            {editId && <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => { setEditId(""); setForm(blankForm); }} sx={{ height: 56 }}>Cancel</Button></Grid>}
          </Grid>
        </Paper>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            {Object.keys(filters).map((key) => <Grid item xs={12} md={2.4} key={key}><TextField fullWidth label={key} value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} /></Grid>)}
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => loadRows()} sx={{ height: 56 }}>Filter</Button></Grid>
          </Grid>
        </Paper>
        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}><Box sx={{ height: 560 }}><DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} disableRowSelectionOnClick /></Box></Paper>
      </Box>
    </MenuPageShell>
  );
}
