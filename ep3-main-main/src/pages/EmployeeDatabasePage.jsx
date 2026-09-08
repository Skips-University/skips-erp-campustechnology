import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ep1 from "../api/ep1";
import global1 from "./global1";

const fieldTypes = ["text", "number", "date", "dropdown", "textarea", "email", "phone"];
const yesNo = ["Yes", "No"];

const blankField = {
  label: "",
  fieldname: "",
  type: "text",
  options: "",
  iseditable: "Yes",
  isrequired: "No",
  isactive: "Yes",
  order: 0
};

const blankEmployee = {
  name: "",
  email: "",
  phone: "",
  employeeid: "",
  login: "",
  institution: "",
  department: "",
  status: "Active",
  customFields: {}
};

const safeId = () => `${Date.now()}-${Math.random()}`;
const optionsText = (value) => Array.isArray(value) ? value.join(", ") : String(value || "");

export default function EmployeeDatabasePage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [fieldForm, setFieldForm] = useState(blankField);
  const [employeeForm, setEmployeeForm] = useState(blankEmployee);
  const [editingFieldId, setEditingFieldId] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([loadFields(), loadEmployees()]);
  };

  const loadFields = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/employee-database-fields", {
        params: { colid: global1.colid, activeOnly: "No" }
      });
      setFields(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load employee custom fields");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setEmployeeLoading(true);
      const res = await ep1.get("/api/v2/employee-database", {
        params: { colid: global1.colid }
      });
      setEmployees(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load employees");
    } finally {
      setEmployeeLoading(false);
    }
  };

  const activeFields = useMemo(() => fields
    .filter((field) => String(field.isactive || "Yes").trim().toLowerCase() !== "no")
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || String(a.label || "").localeCompare(String(b.label || ""))), [fields]);

  const updateEmployee = (field, value) => {
    setEmployeeForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateCustom = (fieldname, value) => {
    setEmployeeForm((prev) => ({
      ...prev,
      customFields: { ...(prev.customFields || {}), [fieldname]: value }
    }));
  };

  const saveField = async () => {
    try {
      if (!fieldForm.label) {
        setError("Field label is required");
        return;
      }
      setError("");
      setMessage("");
      const payload = { ...fieldForm, colid: global1.colid, user: global1.user };
      if (editingFieldId) {
        await ep1.post("/api/v2/employee-database-fields-update", { ...payload, id: editingFieldId });
        setMessage("Employee field updated");
      } else {
        await ep1.post("/api/v2/employee-database-fields", payload);
        setMessage("Employee field added");
      }
      setFieldForm(blankField);
      setEditingFieldId("");
      loadFields();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save employee field");
    }
  };

  const editField = (row) => {
    setEditingFieldId(row._id);
    setFieldForm({
      label: row.label || "",
      fieldname: row.fieldname || "",
      type: row.type || "text",
      options: optionsText(row.options),
      iseditable: row.iseditable || "Yes",
      isrequired: row.isrequired || "No",
      isactive: row.isactive || "Yes",
      order: row.order || 0
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteField = async (row) => {
    if (!window.confirm("Delete this employee field?")) return;
    try {
      await ep1.post("/api/v2/employee-database-fields-delete", { id: row._id, colid: global1.colid });
      setMessage("Employee field deleted");
      loadFields();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete employee field");
    }
  };

  const saveEmployee = async () => {
    try {
      setError("");
      setMessage("");
      const payload = { ...employeeForm, colid: global1.colid, user: global1.user };
      if (editingEmployeeId) {
        await ep1.post("/api/v2/employee-database-update", { ...payload, id: editingEmployeeId });
        setMessage("Employee updated");
      } else {
        await ep1.post("/api/v2/employee-database", payload);
        setMessage("Employee added");
      }
      setEmployeeForm(blankEmployee);
      setEditingEmployeeId("");
      loadEmployees();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save employee");
    }
  };

  const editEmployee = (row) => {
    setEditingEmployeeId(row._id);
    setEmployeeForm({
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      employeeid: row.employeeid || "",
      login: row.login || "",
      institution: row.institution || "",
      department: row.department || "",
      status: row.status || "Active",
      customFields: row.customFields || {}
    });
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const deleteEmployee = async (row) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await ep1.post("/api/v2/employee-database-delete", { id: row._id, colid: global1.colid });
      setMessage("Employee deleted");
      loadEmployees();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete employee");
    }
  };

  const downloadFieldTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        label: "Department",
        fieldname: "department",
        type: "dropdown",
        options: "Accounts, Administration, Academics",
        iseditable: "Yes",
        isrequired: "No",
        isactive: "Yes",
        order: 1
      }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Fields");
    XLSX.writeFile(workbook, "employee_database_fields_template.xlsx");
  };

  const uploadFields = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({ ...row, rowNumber: index + 2 }));
      const res = await ep1.post("/api/v2/employee-database-fields-bulk", { colid: global1.colid, user: global1.user, items: rows });
      const errors = res.data?.errors || [];
      setMessage(`${res.data?.saved || 0} fields uploaded${errors.length ? `, ${errors.length} rows skipped` : ""}`);
      setError(errors.length ? errors.map((item) => `Row ${item.rowNumber}: ${item.msg}`).join("; ") : "");
      loadFields();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload employee fields");
    }
  };

  const downloadEmployeeTemplate = () => {
    const sample = {
      "Employee Name": "Employee Name",
      "Employee Email": "employee@example.com",
      "Phone": "9999999999",
      "Employee ID": "EMP001",
      "Login": "employee.login",
      "Institution": global1.insname || "Institution",
      "Department": "Administration",
      "Status": "Active"
    };
    activeFields.forEach((field) => {
      sample[field.label || field.fieldname] = field.type === "date" ? "2026-05-06" : "";
    });
    const worksheet = XLSX.utils.json_to_sheet([sample]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employee_database_template.xlsx");
  };

  const uploadEmployees = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({ ...row, rowNumber: index + 2 }));
      const res = await ep1.post("/api/v2/employee-database-bulk", { colid: global1.colid, user: global1.user, items: rows });
      const errors = res.data?.errors || [];
      setMessage(`${res.data?.saved || 0} employees uploaded${errors.length ? `, ${errors.length} rows skipped` : ""}`);
      setError(errors.length ? errors.map((item) => `Row ${item.rowNumber}: ${item.msg}`).join("; ") : "");
      loadEmployees();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload employees");
    }
  };

  const fieldColumns = [
    { field: "label", headerName: "Label", width: 180 },
    { field: "fieldname", headerName: "Field Key", width: 170 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "options", headerName: "Options", width: 240, valueGetter: (params) => optionsText(params.row.options) },
    { field: "iseditable", headerName: "Editable by User", width: 150 },
    { field: "isrequired", headerName: "Required", width: 110 },
    { field: "isactive", headerName: "Active", width: 100 },
    { field: "order", headerName: "Order", width: 90, type: "number" },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editField(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteField(params.row)} />
      ]
    }
  ];

  const employeeColumns = [
    { field: "name", headerName: "Name", width: 180 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "employeeid", headerName: "Employee ID", width: 150 },
    { field: "login", headerName: "Login", width: 150 },
    { field: "institution", headerName: "Institution", width: 190 },
    { field: "department", headerName: "Department", width: 170 },
    { field: "status", headerName: "Status", width: 110 },
    ...activeFields.map((field) => ({
      field: `custom_${field.fieldname}`,
      headerName: field.label,
      width: 170,
      valueGetter: (params) => params.row.customFields?.[field.fieldname] || ""
    })),
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editEmployee(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteEmployee(params.row)} />
      ]
    }
  ];

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Employee Database</Typography>
          <Typography variant="body2" color="text.secondary">Create employee records and define extra fields for this database.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6">{editingFieldId ? "Edit Employee Field" : "Add Employee Field"}</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadFieldTemplate}>Field Template</Button>
            <Button component="label" variant="contained" startIcon={<UploadFileIcon />}>
              Upload Fields
              <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadFields} />
            </Button>
          </Stack>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField fullWidth label="Field Label" value={fieldForm.label} onChange={(e) => setFieldForm((prev) => ({ ...prev, label: e.target.value }))} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth label="Field Key" value={fieldForm.fieldname} onChange={(e) => setFieldForm((prev) => ({ ...prev, fieldname: e.target.value }))} helperText="Optional" /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Type" value={fieldForm.type} onChange={(e) => setFieldForm((prev) => ({ ...prev, type: e.target.value }))}>{fieldTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Dropdown Options" value={fieldForm.options} onChange={(e) => setFieldForm((prev) => ({ ...prev, options: e.target.value }))} helperText="Comma separated" /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Editable by User" value={fieldForm.iseditable} onChange={(e) => setFieldForm((prev) => ({ ...prev, iseditable: e.target.value }))}>{yesNo.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Required" value={fieldForm.isrequired} onChange={(e) => setFieldForm((prev) => ({ ...prev, isrequired: e.target.value }))}>{yesNo.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Active" value={fieldForm.isactive} onChange={(e) => setFieldForm((prev) => ({ ...prev, isactive: e.target.value }))}>{yesNo.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Order" value={fieldForm.order} onChange={(e) => setFieldForm((prev) => ({ ...prev, order: e.target.value }))} /></Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={saveField} sx={{ height: 56 }}>{editingFieldId ? "Update Field" : "Save Field"}</Button>
              {editingFieldId && <Button variant="outlined" onClick={() => { setEditingFieldId(""); setFieldForm(blankField); }} sx={{ height: 56 }}>Cancel</Button>}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={fields.map((row) => ({ ...row, id: row._id || safeId() }))}
          columns={fieldColumns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "employee_database_fields" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1300 }}
        />
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">{editingEmployeeId ? "Edit Employee" : "Add Employee"}</Typography>
            <Typography variant="body2" color="text.secondary">Bulk upload template includes every active employee field.</Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadEmployeeTemplate}>Employee Template</Button>
            <Button component="label" variant="contained" startIcon={<UploadFileIcon />}>
              Upload Employees
              <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadEmployees} />
            </Button>
          </Stack>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField fullWidth required label="Name" value={employeeForm.name} onChange={(e) => updateEmployee("name", e.target.value)} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth required label="Email" value={employeeForm.email} onChange={(e) => updateEmployee("email", e.target.value)} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth label="Phone" value={employeeForm.phone} onChange={(e) => updateEmployee("phone", e.target.value)} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth required label="Employee ID" value={employeeForm.employeeid} onChange={(e) => updateEmployee("employeeid", e.target.value)} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth label="Login" value={employeeForm.login} onChange={(e) => updateEmployee("login", e.target.value)} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Institution" value={employeeForm.institution} onChange={(e) => updateEmployee("institution", e.target.value)} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Department" value={employeeForm.department} onChange={(e) => updateEmployee("department", e.target.value)} /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Status" value={employeeForm.status} onChange={(e) => updateEmployee("status", e.target.value)}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Custom Fields</Typography>
                <Typography variant="body2" color="text.secondary">
                  These fields are created above and are also included in the employee Excel template.
                </Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={loadFields}>Reload Fields</Button>
            </Stack>
          </Grid>
          {!activeFields.length && (
            <Grid item xs={12}>
              <Alert severity="info">No active custom fields are available. Add a field above and it will appear here and in the Excel template.</Alert>
            </Grid>
          )}
          {activeFields.map((field) => (
            <Grid item xs={12} md={field.type === "textarea" ? 6 : 3} key={field._id || field.fieldname}>
              <TextField
                select={field.type === "dropdown"}
                multiline={field.type === "textarea"}
                minRows={field.type === "textarea" ? 3 : undefined}
                fullWidth
                required={field.isrequired === "Yes"}
                type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                label={field.label}
                value={employeeForm.customFields?.[field.fieldname] || ""}
                onChange={(e) => updateCustom(field.fieldname, e.target.value)}
                InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
                helperText={field.iseditable === "Yes" ? "Editable by user" : "Not editable by user"}
              >
                {(field.options || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={saveEmployee}>{editingEmployeeId ? "Update Employee" : "Save Employee"}</Button>
              {editingEmployeeId && <Button variant="outlined" onClick={() => { setEditingEmployeeId(""); setEmployeeForm(blankEmployee); }}>Cancel</Button>}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <Box sx={{ px: 1, py: 1 }}>
          <Typography variant="h6">Employees</Typography>
        </Box>
        <Divider />
        <DataGrid
          rows={employees.map((row) => ({ ...row, id: row._id || safeId() }))}
          columns={employeeColumns}
          loading={employeeLoading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "employee_database" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: Math.max(1500, 1230 + activeFields.length * 170) }}
        />
      </Paper>
    </Box>
  );
}
