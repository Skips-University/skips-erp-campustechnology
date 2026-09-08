import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function StudentDocumentMappingBulkPage() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const hasAllAccess = /^all$/i.test(String(global1.role || "").trim());

  useEffect(() => {
    if (!hasAllAccess) return;
    ep1.get("/api/v2/student-document-mapping/meta", { params: { actorrole: global1.role } })
      .then((res) => setFields(res.data?.fields || []))
      .catch((err) => setError(err.response?.data?.msg || "Unable to load document fields"))
      .finally(() => setLoading(false));
  }, [hasAllAccess]);

  const downloadTemplate = () => {
    const row = { email: "", regno: "" };
    fields.forEach((field) => { row[field.field] = ""; });
    const sheet = XLSX.utils.json_to_sheet([row]);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Document Mapping");
    XLSX.writeFile(book, "student_document_mapping_template.xlsx");
  };

  const uploadMapping = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setUploading(true);
      setError("");
      setMessage("");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!rows.length) throw new Error("No mapping rows found in the file");
      const items = rows.map((row, index) => {
        const item = { rowNumber: index + 2, email: row.email || row.Email || "", regno: row.regno || row.Regno || row["Registration Number"] || "" };
        fields.forEach((field) => { item[field.field] = row[field.field] || ""; });
        return item;
      });
      const res = await ep1.post("/api/v2/student-document-mapping/bulk", { colid: global1.colid, user: global1.user, actorrole: global1.role, items });
      const errors = res.data?.errors || [];
      setMessage(`${res.data?.mapped || 0} student document mappings completed${errors.length ? `; ${errors.length} rows were not mapped` : ""}.`);
      if (errors.length) setError(errors.map((item) => `Row ${item.rowNumber}: ${item.msg}`).join("; "));
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Unable to map documents");
    } finally {
      setUploading(false);
    }
  };

  return (
    <MenuPageShell title="Student Document Mapping" menuType="admin">
      {!hasAllAccess ? <Alert severity="error">This page is available to users with Role: All only.</Alert> : (
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>Student Document Mapping Bulk Upload</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Link existing AWS S3 documents to students by email or registration number. Each file is verified in the configured AWS bucket before it is saved.</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography fontWeight={700}>How to prepare the mapping file</Typography>
              <Typography variant="body2">Use either <b>email</b> or <b>regno</b> for each student. In a document column, enter an S3 object key (recommended) or an S3 URL from the institution’s configured AWS bucket.</Typography>
              <Typography variant="body2">Example object key: <code>1/student-profile-documents/student@example.com/sscCertificateFile/ssc.pdf</code></Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" startIcon={<DownloadIcon />} disabled={loading || !fields.length} onClick={downloadTemplate}>Download mapping template</Button>
                <Button component="label" variant="contained" startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />} disabled={uploading || loading || !fields.length}>
                  {uploading ? "Mapping documents..." : "Upload mapping Excel"}
                  <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadMapping} />
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary">Document fields: {fields.map((field) => field.label).join(", ")}</Typography>
            </Stack>
          </Paper>
        </Box>
      )}
    </MenuPageShell>
  );
}