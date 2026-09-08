import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit, FileDownload, Save, UploadFile } from "@mui/icons-material";
import * as XLSX from "xlsx";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyForm = {
  formname: "",
  formid: "",
  documentname: "",
  description: "",
  required: "No",
  allowedfiletypes: "pdf,jpg,jpeg,png",
  maxfilesize: "",
  displayorder: 0,
  status: "Active"
};

const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const headerMap = {
  formname: "formname",
  formid: "formid",
  documentname: "documentname",
  document: "documentname",
  description: "description",
  required: "required",
  mandatory: "required",
  allowedfiletypes: "allowedfiletypes",
  allowedtypes: "allowedfiletypes",
  maxfilesize: "maxfilesize",
  displayorder: "displayorder",
  order: "displayorder",
  status: "status"
};

export default function AdmissionFormDocumentsPage() {
  const [rows, setRows] = useState([]);
  const [forms, setForms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [uploadRows, setUploadRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formOptions = useMemo(() => forms.map((item) => ({
    label: `${item.title || item.formname || item.formid} (${item.formid})`,
    formname: item.title || item.formname || item.formid,
    formid: item.formid
  })), [forms]);

  const loadForms = async () => {
    const res = await ep1.get("/admission-dynamic/forms", { params: { colid: global1.colid } });
    setForms(res.data || []);
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/admission-form-documents", { params: { colid: global1.colid } });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load form documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
    loadRows();
  }, []);

  const selectKnownForm = (formid) => {
    const selected = formOptions.find((item) => item.formid === formid);
    setForm((prev) => ({ ...prev, formid, formname: selected?.formname || prev.formname }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const saveDocument = async () => {
    try {
      const payload = { ...form, colid: global1.colid, user: global1.user };
      if (editingId) {
        await ep1.post("/admission-form-documents-update", { ...payload, id: editingId });
        setMessage("Form document updated");
      } else {
        await ep1.post("/admission-form-documents", payload);
        setMessage("Form document added");
      }
      resetForm();
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save form document");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      formname: row.formname || "",
      formid: row.formid || "",
      documentname: row.documentname || "",
      description: row.description || "",
      required: row.required || "No",
      allowedfiletypes: row.allowedfiletypes || "pdf,jpg,jpeg,png",
      maxfilesize: row.maxfilesize || "",
      displayorder: row.displayorder || 0,
      status: row.status || "Active"
    });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete ${row.documentname}?`)) return;
    try {
      await ep1.post("/admission-form-documents-delete", { id: row._id, colid: global1.colid });
      setMessage("Form document deleted");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete form document");
    }
  };

  const buildTemplate = () => {
    const selected = formOptions[0] || {};
    const ws = XLSX.utils.json_to_sheet([{
      "Form Name": selected.formname || "Admission Form",
      "Form ID": selected.formid || "default",
      "Document Name": "10th Marksheet",
      Description: "Upload clear copy",
      Required: "Yes",
      "Allowed File Types": "pdf,jpg,jpeg,png",
      "Max File Size": "2 MB",
      "Display Order": 1,
      Status: "Active"
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Form Documents");
    XLSX.writeFile(wb, "Admission_Form_Documents_Template.xlsx");
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        const parsed = jsonRows.map((row, index) => {
          const item = { rowNumber: index + 2, colid: global1.colid, user: global1.user };
          Object.entries(row).forEach(([header, value]) => {
            const mapped = headerMap[normalizeHeader(header)];
            if (mapped) item[mapped] = value;
          });
          return item;
        });
        setUploadRows(parsed);
        setMessage(`${parsed.length} rows ready for upload`);
      } catch (err) {
        setError("Unable to read Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const uploadExcel = async () => {
    if (!uploadRows.length) {
      setError("Please choose an Excel file first");
      return;
    }
    try {
      const res = await ep1.post("/admission-form-documents-bulk", {
        colid: global1.colid,
        user: global1.user,
        items: uploadRows
      });
      const errors = res.data.errors || [];
      setMessage(`Uploaded ${res.data.inserted || 0} row(s)${errors.length ? `, ${errors.length} error(s)` : ""}`);
      setUploadRows([]);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    }
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Button size="small" startIcon={<Edit />} onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="error" startIcon={<Delete />} onClick={() => deleteRow(params.row)}>Delete</Button>
        </Stack>
      )
    },
    { field: "formname", headerName: "Form Name", width: 220 },
    { field: "formid", headerName: "Form ID", width: 160 },
    { field: "documentname", headerName: "Document Name", width: 220 },
    { field: "description", headerName: "Description", width: 260 },
    { field: "required", headerName: "Required", width: 110 },
    { field: "allowedfiletypes", headerName: "Allowed Types", width: 170 },
    { field: "maxfilesize", headerName: "Max Size", width: 120 },
    { field: "displayorder", headerName: "Order", width: 100, type: "number" },
    { field: "status", headerName: "Status", width: 120 }
  ];

  return (
    <MenuPageShell title="Form Documents">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Admission Form Documents</Typography>
            <Typography color="text.secondary">Define document list for each dynamic admission form.</Typography>
          </Box>
          <Chip label={`${rows.length} records`} />
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Select Form" value={form.formid} onChange={(e) => selectKnownForm(e.target.value)}>
                <MenuItem value="">Type manually</MenuItem>
                {formOptions.map((item) => <MenuItem key={item.formid} value={item.formid}>{item.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Form Name" value={form.formname} onChange={(e) => setForm((prev) => ({ ...prev, formname: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Form ID" value={form.formid} onChange={(e) => setForm((prev) => ({ ...prev, formid: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth required label="Document Name" value={form.documentname} onChange={(e) => setForm((prev) => ({ ...prev, documentname: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Required" value={form.required} onChange={(e) => setForm((prev) => ({ ...prev, required: e.target.value }))}>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Allowed File Types" value={form.allowedfiletypes} onChange={(e) => setForm((prev) => ({ ...prev, allowedfiletypes: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Max File Size" value={form.maxfilesize} onChange={(e) => setForm((prev) => ({ ...prev, maxfilesize: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Display Order" value={form.displayorder} onChange={(e) => setForm((prev) => ({ ...prev, displayorder: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="contained" startIcon={<Save />} onClick={saveDocument}>{editingId ? "Update" : "Save"}</Button>
                <Button variant="outlined" onClick={resetForm}>Clear</Button>
                <Button variant="outlined" startIcon={<FileDownload />} onClick={buildTemplate}>Download Template</Button>
                <Button variant="outlined" component="label" startIcon={<UploadFile />}>
                  Choose Excel
                  <input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} />
                </Button>
                <Button variant="contained" color="secondary" disabled={!uploadRows.length} onClick={uploadExcel}>Upload {uploadRows.length ? `(${uploadRows.length})` : ""}</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={rows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admission_form_documents" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1650 }}
          />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
