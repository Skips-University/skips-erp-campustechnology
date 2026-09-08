import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const identity = () => global1.user || global1.email || "";
dayjs.extend(customParseFormat);

function ValueField({ field, value, onChange }) {
  const multiline = /address/i.test(field.field);
  const options = Array.isArray(field.options) ? field.options : [];
  if (field.field === "birthdate") {
    const strictFormattedDate = value ? dayjs(value, "DD-MM-YYYY", true) : null;
    const parsedValue = strictFormattedDate?.isValid() ? strictFormattedDate : (value ? dayjs(value) : null);
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={field.label}
          value={parsedValue?.isValid() ? parsedValue : null}
          format="DD-MM-YYYY"
          disabled={field.readOnly}
          onChange={(date) => onChange(field.field, date?.isValid() ? date.format("DD-MM-YYYY") : "")}
          slotProps={{ textField: { fullWidth: true, size: "small", helperText: field.readOnly ? "Read only" : "DD-MM-YYYY" } }}
        />
      </LocalizationProvider>
    );
  }
  if (options.length) {
    return (
      <TextField
        select
        fullWidth
        size="small"
        label={field.label}
        value={value ?? ""}
        disabled={field.readOnly}
        onChange={(event) => onChange(field.field, event.target.value)}
        helperText={field.readOnly ? "Read only" : ""}
      >
        {!field.readOnly && <MenuItem value="">Select {field.label}</MenuItem>}
        {options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </TextField>
    );
  }
  return (
    <TextField
      fullWidth
      size="small"
      label={field.label}
      value={value ?? ""}
      onChange={(event) => onChange(field.field, event.target.value)}
      InputProps={{ readOnly: field.readOnly }}
      multiline={multiline}
      minRows={multiline ? 2 : undefined}
      helperText={field.readOnly ? "Read only" : ""}
    />
  );
}

function DocumentField({ field, value, selectedFile, uploading, onSelect, onUpload }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
      <Typography fontWeight={700} variant="body2" sx={{ mb: 1 }}>{field.label}</Typography>
      {value ? (
        <Link href={value} target="_blank" rel="noreferrer" sx={{ display: "block", mb: 1, overflowWrap: "anywhere" }}>
          View uploaded file
        </Link>
      ) : <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>No file uploaded</Typography>}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
        <Button size="small" variant="outlined" component="label" disabled={uploading}>
          Choose file
          <input hidden type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => onSelect(field.field, event.target.files?.[0] || null)} />
        </Button>
        <Typography variant="caption" noWrap sx={{ flex: 1 }}>{selectedFile?.name || "No file selected"}</Typography>
        <Button size="small" variant="contained" startIcon={uploading ? <CircularProgress size={15} color="inherit" /> : <UploadFileIcon />} disabled={!selectedFile || uploading} onClick={() => onUpload(field)}>
          Upload
        </Button>
      </Stack>
      {field.field === "photo" && <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>Passport photo accepts JPG, JPEG or PNG only.</Typography>}
    </Paper>
  );
}

export default function StudentCompleteProfilePage() {
  const [sections, setSections] = useState([]);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/student-complete-profile", { params: { colid: global1.colid, email: identity() } });
      setSections(res.data?.sections || []);
      setValues(res.data?.values || {});
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load complete profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/student-complete-profile", { colid: global1.colid, email: identity(), values });
      setValues(res.data?.values || values);
      setMessage(res.data?.msg || "Profile updated");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save profile");
    } finally {
      setSaving(false);
    }
  };

  const uploadDocument = async (field) => {
    const file = files[field.field];
    if (!file) return;
    try {
      setUploadingField(field.field);
      setError("");
      setMessage("");
      const data = new FormData();
      data.append("file", file);
      data.append("colid", global1.colid);
      data.append("email", identity());
      data.append("field", field.field);
      const res = await ep1.post("/api/v2/student-complete-profile-document", data, { headers: { "Content-Type": "multipart/form-data" } });
      const url = res.data?.url || "";
      setValues((old) => ({ ...old, [field.field]: url }));
      setFiles((old) => ({ ...old, [field.field]: null }));
      setMessage(`${field.label} uploaded`);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload document");
    } finally {
      setUploadingField("");
    }
  };

  return (
    <MenuPageShell title="Complete Profile" menuType="student">
      <Box>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Complete Profile</Typography>
            <Typography color="text.secondary">Update your personal, academic, address, employment, family and other details. Locked academic identity fields are maintained by the institution.</Typography>
          </Box>
          <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} disabled={saving || loading} onClick={save}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </Stack>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {loading && <Alert severity="info">Loading profile...</Alert>}
        {!loading && sections.map((section) => (
          <Paper key={section.title} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>{section.title}</Typography>
            {section.document ? (
              <Grid container spacing={1.5}>
                {section.fields.map((field) => field.document ? (
                  <Grid item xs={12} md={6} key={field.field}>
                    <DocumentField field={field} value={values[field.field]} selectedFile={files[field.field]} uploading={uploadingField === field.field} onSelect={(key, file) => setFiles((old) => ({ ...old, [key]: file }))} onUpload={uploadDocument} />
                  </Grid>
                ) : (
                  <Grid item xs={12} md={4} key={field.field}>
                    <ValueField field={field} value={values[field.field]} onChange={(key, value) => setValues((old) => ({ ...old, [key]: value }))} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={1.5}>
                {section.fields.map((field) => <Grid item xs={12} md={4} key={`${section.title}-${field.field}`}><ValueField field={field} value={values[field.field]} onChange={(key, value) => setValues((old) => ({ ...old, [key]: value }))} /></Grid>)}
              </Grid>
            )}
          </Paper>
        ))}
      </Box>
    </MenuPageShell>
  );
}