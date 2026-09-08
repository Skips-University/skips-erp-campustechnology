import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";

const standardFields = [
  { key: "formid", label: "Form ID", sample: "default" },
  { key: "academicyear", label: "Academic Year", sample: "2026-27" },
  { key: "programtype", label: "Program Type", sample: "UG" },
  { key: "programapplied", label: "Program Applied", sample: "B.Com" },
  { key: "programcode", label: "Program Code", sample: "BCOM" },
  { key: "name", label: "Name", sample: "Student Name" },
  { key: "username", label: "Username", sample: "student@example.com" },
  { key: "password", label: "Password", sample: "Student@123" },
  { key: "email", label: "Email", sample: "student@example.com" },
  { key: "phone", label: "Phone", sample: "9999999999" },
  { key: "address", label: "Address", sample: "Address" },
  { key: "pin", label: "Pin", sample: "700001" },
  { key: "gender", label: "Gender", sample: "Male" },
  { key: "category", label: "Category", sample: "General" },
  { key: "ews", label: "EWS", sample: "No" },
  { key: "ph", label: "PH", sample: "No" },
  { key: "minority", label: "Minority", sample: "No" },
  { key: "tenthmarks", label: "Tenth Marks", sample: "85" },
  { key: "twelvemarks", label: "Twelve Marks", sample: "88" },
  { key: "externaltheorymarks", label: "External Theory Marks", sample: "76" },
  { key: "englishmarks", label: "English Marks", sample: "80" },
  { key: "dateofbirth", label: "Date of Birth", sample: "2008-04-20" },
  { key: "dateofapplication", label: "Date of Application", sample: new Date().toISOString().slice(0, 10) },
  { key: "age", label: "Age", sample: "18" },
  { key: "twelvesubjects", label: "Twelve Subjects", sample: "English, Accountancy, Commerce" },
  { key: "tenthsubjectmarks", label: "Tenth Subject Marks", sample: "Math:90, English:85" },
  { key: "twelvesubjectmarks", label: "Twelve Subject Marks", sample: "English:80, Accountancy:90" },
  { key: "applicationstatus", label: "Application Status", sample: "Applied" }
];

const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const parseSubjectMarks = (value) => {
  if (Array.isArray(value)) return value;
  const text = String(value || "").trim();
  if (!text) return [];
  return text.split(",").map((item) => {
    const [subject, marks] = item.split(":");
    return { subject: String(subject || "").trim(), marks: Number(String(marks || "").trim() || 0) };
  }).filter((item) => item.subject);
};

const calculateAge = (dateofbirth, dateofapplication) => {
  if (!dateofbirth || !dateofapplication) return "";
  const birthDate = new Date(dateofbirth);
  const applicationDate = new Date(dateofapplication);
  if (Number.isNaN(birthDate.getTime()) || Number.isNaN(applicationDate.getTime())) return "";
  let age = applicationDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = applicationDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && applicationDate.getDate() < birthDate.getDate())) age -= 1;
  return age >= 0 ? age : "";
};

export default function DynamicAdmissionBulkUploadPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    const res = await ep1.get(`/admission-dynamic/fields?colid=${global1.colid}`);
    setFields(res.data || []);
  };

  const headerMap = useMemo(() => {
    const map = new Map();
    standardFields.forEach((field) => {
      map.set(normalizeHeader(field.label), { type: "standard", key: field.key });
      map.set(normalizeHeader(field.key), { type: "standard", key: field.key });
    });
    fields.forEach((field) => {
      map.set(normalizeHeader(field.label), { type: "extra", key: field.fieldname });
      map.set(normalizeHeader(field.fieldname), { type: "extra", key: field.fieldname });
    });
    return map;
  }, [fields]);

  const previewColumns = useMemo(() => [
    { field: "rowNumber", headerName: "Excel Row", width: 100 },
    { field: "name", headerName: "Name", flex: 1.2 },
    { field: "email", headerName: "Email", flex: 1.3 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "academicyear", headerName: "Academic Year", flex: 1 },
    { field: "programapplied", headerName: "Program", flex: 1.3 },
    { field: "programcode", headerName: "Program Code", flex: 1 },
    { field: "category", headerName: "Category", flex: 0.9 },
    { field: "applicationstatus", headerName: "Status", flex: 0.9 },
    ...fields.map((field) => ({
      field: `extra_${field.fieldname}`,
      headerName: field.label,
      flex: 1
    }))
  ], [fields]);

  const flattenPreview = (item) => {
    const extraValues = {};
    Object.entries(item.extraFields || {}).forEach(([key, value]) => {
      extraValues[`extra_${key}`] = value;
    });
    return { ...item, ...extraValues };
  };

  const buildTemplate = () => {
    const templateRow = {};
    standardFields.forEach((field) => {
      templateRow[field.label] = field.sample;
    });
    fields.forEach((field) => {
      templateRow[field.label] = (field.options || [])[0] || "";
    });

    const ws = XLSX.utils.json_to_sheet([templateRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Admission Upload");
    XLSX.writeFile(wb, "Dynamic_Admission_Upload_Template.xlsx");
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array", cellDates: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const parsedRows = jsonRows.map((row, index) => {
          const item = {
            rowNumber: index + 2,
            colid: global1.colid,
            user: global1.user,
            extraFields: {}
          };

          Object.entries(row).forEach(([header, value]) => {
            const target = headerMap.get(normalizeHeader(header));
            if (!target) return;
            if (target.type === "extra") {
              item.extraFields[target.key] = value;
            } else if (target.key === "tenthsubjectmarks" || target.key === "twelvesubjectmarks") {
              item[target.key] = parseSubjectMarks(value);
            } else {
              item[target.key] = value;
            }
          });

          item.applicationstatus = item.applicationstatus || "Applied";
          item.dateofapplication = item.dateofapplication || new Date().toISOString().slice(0, 10);
          item.age = item.age || calculateAge(item.dateofbirth, item.dateofapplication);
          return item;
        });

        setRows(parsedRows.map(flattenPreview));
        setMessage({ severity: "success", text: `${parsedRows.length} rows loaded. Review and upload.` });
      } catch (err) {
        setMessage({ severity: "error", text: "Unable to read Excel file" });
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const uploadRows = async () => {
    if (rows.length === 0) {
      setMessage({ severity: "warning", text: "Load Excel rows first" });
      return;
    }

    try {
      setUploading(true);
      const items = rows.map((row) => {
        const extraFields = {};
        Object.entries(row).forEach(([key, value]) => {
          if (key.startsWith("extra_")) extraFields[key.replace("extra_", "")] = value;
        });
        return {
          ...row,
          extraFields,
          tenthsubjectmarks: parseSubjectMarks(row.tenthsubjectmarks),
          twelvesubjectmarks: parseSubjectMarks(row.twelvesubjectmarks)
        };
      });

      const res = await ep1.post("/admission-dynamic/applications-bulk", {
        colid: global1.colid,
        items
      });

      const errors = res.data?.errors || [];
      setMessage({
        severity: errors.length ? "warning" : "success",
        text: `Inserted ${res.data?.inserted || 0} rows. ${errors.length ? `Errors: ${errors.map((err) => `Row ${err.rowNumber}: ${err.msg}`).join("; ")}` : ""}`
      });
    } catch (err) {
      setMessage({ severity: "error", text: err.response?.data?.msg || "Bulk upload failed" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Grid container spacing={2} padding={2}>
      <Grid item xs={12}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>Dynamic Admission Bulk Upload</Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={buildTemplate}>
              Download Template
            </Button>
            <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
              Select Excel
              <input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} />
            </Button>
            <Button variant="contained" color="success" onClick={uploadRows} disabled={uploading || rows.length === 0}>
              {uploading ? "Uploading..." : "Upload Rows"}
            </Button>
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Subject marks can be entered as Math:90, English:85. Custom fields are included in the template automatically.
          </Typography>
        </Paper>
      </Grid>

      {message && (
        <Grid item xs={12}>
          <Alert severity={message.severity}>{message.text}</Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Preview</Typography>
            <Typography color="text.secondary">{rows.length} rows</Typography>
          </Stack>
          <Box sx={{ height: 620, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={previewColumns}
              getRowId={(row) => row.rowNumber}
              slots={{ toolbar: GridToolbar }}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
