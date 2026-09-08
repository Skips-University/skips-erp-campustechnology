import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import LogoutIcon from "@mui/icons-material/Logout";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankForm = {
  role: "",
  documentname: "",
  category: "",
  order: 0,
  description: "",
  mandatory: "Yes",
  status: "Active"
};

export default function UserDocumentRequirementPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRoles();
    loadRows();
  }, []);

  const loadRoles = async () => {
    try {
      const res = await ep1.get("/api/v2/user-documents/roles", { params: { colid: global1.colid } });
      setRoles(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load roles");
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/user-document-requirements", { params: { colid: global1.colid } });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load document list");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const saveRow = async () => {
    if (!form.role || !form.documentname) {
      setError("Role and document name are required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/user-document-requirements", {
        ...form,
        id: editingId,
        colid: global1.colid,
        user: global1.user
      });
      setMessage(editingId ? "Document requirement updated" : "Document requirement added");
      resetForm();
      loadRows();
      loadRoles();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save document requirement");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      role: row.role || "",
      documentname: row.documentname || "",
      category: row.category || "",
      order: row.order ?? 0,
      description: row.description || "",
      mandatory: row.mandatory || "Yes",
      status: row.status || "Active"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this document requirement?")) return;
    try {
      setError("");
      setMessage("");
      await ep1.post("/api/v2/user-document-requirements-delete", { id: row._id, colid: global1.colid });
      setMessage("Document requirement deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete document requirement");
    }
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        role: "Student",
        documentname: "Aadhar Card",
        category: "Identity",
        order: 1,
        description: "Government identity proof",
        mandatory: "Yes",
        status: "Active"
      },
      {
        role: "Faculty",
        documentname: "PAN Card",
        category: "Tax",
        order: 1,
        description: "Tax identity document",
        mandatory: "Yes",
        status: "Active"
      }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Documents");
    XLSX.writeFile(workbook, "rolewise_document_list_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const items = excelRows.map((row, index) => ({
        rowNumber: index + 2,
        role: row.role || row.Role,
        documentname: row.documentname || row["Document Name"] || row.Document,
        category: row.category || row.Category,
        order: row.order || row.Order || 0,
        description: row.description || row.Description,
        mandatory: row.mandatory || row.Mandatory || "Yes",
        status: row.status || row.Status || "Active"
      }));
      const res = await ep1.post("/api/v2/user-document-requirements-bulk", {
        colid: global1.colid,
        user: global1.user,
        items
      });
      const errors = res.data?.errors?.length ? ` Errors: ${res.data.errors.join("; ")}` : "";
      setMessage(`Bulk upload completed. Inserted/updated ${items.length} rows.${errors}`);
      loadRows();
      loadRoles();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload document list");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "role", headerName: "Role", width: 160 },
    { field: "category", headerName: "Category", width: 160 },
    { field: "order", headerName: "Order", width: 100, type: "number" },
    { field: "documentname", headerName: "Document", width: 220 },
    { field: "description", headerName: "Description", width: 280 },
    { field: "mandatory", headerName: "Mandatory", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<EditIcon />} onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => deleteRow(params.row)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Rolewise Document List">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Breadcrumbs sx={{ mb: 1 }}>
                <RouterLink to="/dashdashfacnew" style={{ color: "inherit", textDecoration: "none" }}>Dashboard</RouterLink>
                <Typography color="text.primary">User management</Typography>
                <Typography color="text.primary">Document list</Typography>
              </Breadcrumbs>
              <Typography variant="h4" fontWeight={800}>Rolewise Document List</Typography>
              <Typography color="text.secondary">Maintain documents required for each role.</Typography>
            </Box>
            <Button variant="outlined" color="inherit" startIcon={<LogoutIcon />} onClick={() => navigate("/")}>Logout</Button>
          </Stack>

          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {(loading || saving) && <LinearProgress />}

          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2.5}>
                <TextField select fullWidth label="Role" value={form.role} onChange={(e) => updateForm("role", e.target.value)}>
                  {roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField fullWidth label="Or type role" value={form.role} onChange={(e) => updateForm("role", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth label="Category" value={form.category} onChange={(e) => updateForm("category", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={1.5}>
                <TextField fullWidth type="number" label="Order" value={form.order} onChange={(e) => updateForm("order", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth required label="Document name" value={form.documentname} onChange={(e) => updateForm("documentname", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField fullWidth label="Description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth label="Mandatory" value={form.mandatory} onChange={(e) => updateForm("mandatory", e.target.value)}>
                  {["Yes", "No"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth label="Status" value={form.status} onChange={(e) => updateForm("status", e.target.value)}>
                  {["Active", "Inactive"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={8}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={saveRow} disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</Button>
                  <Button variant="outlined" onClick={resetForm}>Clear</Button>
                  <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadTemplate}>Template</Button>
                  <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                    Bulk upload
                    <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 1, borderRadius: 2, overflowX: "auto" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "rolewise_document_list" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              sx={{ minWidth: 1100 }}
            />
          </Paper>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}
