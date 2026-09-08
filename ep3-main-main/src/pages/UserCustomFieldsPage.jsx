import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankForm = {
  label: "",
  fieldname: "",
  page: "Page 1",
  section: "Additional Details",
  type: "text",
  options: "",
  isrequired: "No",
  isactive: "Yes",
  order: 0
};

const fieldTypes = ["text", "number", "date", "dropdown", "textarea", "email", "phone"];

export default function UserCustomFieldsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/user-custom-fields", {
        params: { colid: global1.colid }
      });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load custom fields");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const saveField = async () => {
    try {
      if (!form.label) {
        setError("Label is required");
        return;
      }
      setError("");
      setMessage("");
      const payload = { ...form, colid: global1.colid, user: global1.user };
      if (editingId) {
        await ep1.post("/api/v2/user-custom-fields-update", { ...payload, id: editingId });
        setMessage("Custom field updated");
      } else {
        await ep1.post("/api/v2/user-custom-fields", payload);
        setMessage("Custom field added");
      }
      resetForm();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save custom field");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      label: row.label || "",
      fieldname: row.fieldname || "",
      page: row.page || "Page 1",
      section: row.section || "Additional Details",
      type: row.type || "text",
      options: (row.options || []).join(", "),
      isrequired: row.isrequired || "No",
      isactive: row.isactive || "Yes",
      order: row.order || 0
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this custom field?")) return;
    try {
      setDeletingId(row._id);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/user-custom-fields-delete", { id: row._id, _id: row._id, colid: global1.colid });
      setRows((prev) => prev.filter((item) => item._id !== row._id));
      setMessage("Custom field deleted");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete custom field");
    } finally {
      setDeletingId("");
    }
  };

  const bulkDeleteRows = async () => {
    if (!selectedRows.length) {
      setError("Select at least one custom field to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.length} selected custom field${selectedRows.length === 1 ? "" : "s"}?`)) return;
    try {
      setBulkDeleting(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/user-custom-fields-bulk-delete", {
        ids: selectedRows,
        colid: global1.colid
      });
      setRows((prev) => prev.filter((item) => !selectedRows.includes(item._id)));
      setSelectedRows([]);
      setMessage("Selected custom fields deleted");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete selected custom fields");
    } finally {
      setBulkDeleting(false);
    }
  };

  const downloadTemplate = () => {
    const rowsForTemplate = [
      {
        label: "Blood Group",
        fieldname: "blood_group",
        page: "Page 1",
        section: "Personal Details",
        type: "dropdown",
        options: "A+, A-, B+, B-, O+, O-, AB+, AB-",
        isrequired: "No",
        isactive: "Yes",
        order: 1
      },
      {
        label: "Local Guardian Name",
        fieldname: "local_guardian_name",
        page: "Page 2",
        section: "Guardian Details",
        type: "text",
        options: "",
        isrequired: "No",
        isactive: "Yes",
        order: 2
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(rowsForTemplate);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Custom Fields");
    XLSX.writeFile(workbook, "user_custom_fields_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!excelRows.length) {
        setError("No rows found in the Excel file");
        return;
      }

      const items = excelRows.map((row, index) => ({
        rowNumber: index + 2,
        label: row.label || row.Label || row["Field Label"] || "",
        fieldname: row.fieldname || row.fieldName || row["Field Key"] || row["field key"] || "",
        page: row.page || row.Page || "Page 1",
        section: row.section || row.Section || "Additional Details",
        type: row.type || row.Type || "text",
        options: row.options || row.Options || "",
        isrequired: row.isrequired || row.required || row.Required || "No",
        isactive: row.isactive || row.active || row.Active || "Yes",
        order: row.order || row.Order || 0
      }));

      const res = await ep1.post("/api/v2/user-custom-fields-bulk", {
        colid: global1.colid,
        user: global1.user,
        items
      });

      const errors = res.data?.errors || [];
      setMessage(`${res.data?.saved || 0} fields uploaded${errors.length ? `, ${errors.length} rows skipped` : ""}`);
      setError(errors.length ? errors.map((item) => `Row ${item.rowNumber}: ${item.msg}`).join("; ") : "");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload custom fields");
    }
  };

  const columns = [
    { field: "label", headerName: "Label", width: 190 },
    { field: "fieldname", headerName: "Field Key", width: 180 },
    { field: "page", headerName: "Page", width: 130 },
    { field: "section", headerName: "Section", width: 180 },
    { field: "type", headerName: "Type", width: 110 },
    {
      field: "options",
      headerName: "Options",
      width: 240,
      valueGetter: (params) => (params.row.options || []).join(", ")
    },
    { field: "isrequired", headerName: "Required", width: 110 },
    { field: "isactive", headerName: "Active", width: 100 },
    { field: "order", headerName: "Order", width: 90, type: "number" },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={(event) => {
              event.stopPropagation();
              editRow(params.row);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            disabled={deletingId === params.row._id}
            onClick={(event) => {
              event.stopPropagation();
              deleteRow(params.row);
            }}
          >
            {deletingId === params.row._id ? "Deleting" : "Delete"}
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>User Custom Fields</Typography>
          <Typography variant="body2" color="text.secondary">Create custom fields that can be stored under the user model customFields data.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6">{editingId ? "Edit Custom Field" : "Add Custom Field"}</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="outlined" onClick={downloadTemplate}>Download Template</Button>
            <Button component="label" variant="contained" startIcon={<UploadFileIcon />}>
              Bulk Upload
              <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Label" value={form.label} onChange={(e) => updateForm("label", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Field Key" value={form.fieldname} onChange={(e) => updateForm("fieldname", e.target.value)} helperText="Optional" />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Page" value={form.page} onChange={(e) => updateForm("page", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Section" value={form.section} onChange={(e) => updateForm("section", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Type" value={form.type} onChange={(e) => updateForm("type", e.target.value)}>
              {fieldTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Options comma separated" value={form.options} onChange={(e) => updateForm("options", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Required" value={form.isrequired} onChange={(e) => updateForm("isrequired", e.target.value)}>
              <MenuItem value="No">No</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Active" value={form.isactive} onChange={(e) => updateForm("isactive", e.target.value)}>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="number" label="Order" value={form.order} onChange={(e) => updateForm("order", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={saveField} sx={{ height: 56 }}>
                {editingId ? "Update" : "Save"}
              </Button>
              {editingId && <Button variant="outlined" onClick={resetForm} sx={{ height: 56 }}>Cancel</Button>}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1} sx={{ p: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {selectedRows.length} selected
          </Typography>
          <Button
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={!selectedRows.length || bulkDeleting}
            onClick={bulkDeleteRows}
          >
            {bulkDeleting ? "Deleting selected..." : "Delete selected"}
          </Button>
        </Stack>
        <DataGrid
          rows={rows}
          getRowId={(row) => row._id}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={(newSelection) => setSelectedRows(Array.isArray(newSelection) ? newSelection : Array.from(newSelection?.ids || []))}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "user_custom_fields" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1450 }}
        />
      </Paper>
    </Box>
  );
}
