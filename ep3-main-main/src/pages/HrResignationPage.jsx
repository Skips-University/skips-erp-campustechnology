import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, CloudUpload, Delete, Edit, Refresh, Save, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const statuses = ["Resigned", "Notice Period", "Absconded", "Completed"];
const documentTypes = ["Resignation Letter", "Clearance Document", "Experience Letter", "Other"];

const emptyForm = {
  id: "",
  employeeid: "",
  resignationdate: "",
  noticeperiod: "",
  lastworkingdate: "",
  status: "Notice Period",
  remarks: ""
};

const dateValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const HrResignationPage = () => {
  const navigate = useNavigate();
  const colid = useMemo(() => global1.colid, []);
  const currentUser = useMemo(() => global1.user, []);
  const [options, setOptions] = useState({ departments: [], admissionyears: [], roles: [] });
  const [filters, setFilters] = useState({ department: "", admissionyear: "", name: "", email: "", phone: "", regno: "", role: "" });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [upload, setUpload] = useState({ documenttype: "Resignation Letter", description: "", file: null });

  const params = (extra = {}) => ({ colid, ...extra });

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/hrresignation/options", { params: params() });
    setOptions({
      departments: res.data.departments || [],
      admissionyears: res.data.admissionyears || [],
      roles: res.data.roles || []
    });
  };

  const loadEmployees = async () => {
    setError("");
    const res = await ep1.get("/api/v2/hrresignation/employees", { params: params(filters) });
    setEmployees(res.data.data || []);
  };

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/hrresignation", { params: params() });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load resignations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }
    loadOptions().catch((err) => setError(err.response?.data?.message || err.message));
    loadEmployees().catch((err) => setError(err.response?.data?.message || err.message));
    loadRows();
  }, [colid]);

  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setForm((prev) => ({ ...prev, employeeid: employee?._id || "" }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedEmployee(null);
    setUpload({ documenttype: "Resignation Letter", description: "", file: null });
  };

  const saveResignation = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = { ...form, colid, user: currentUser };
      const res = form.id
        ? await ep1.post("/api/v2/hrresignation/update", payload)
        : await ep1.post("/api/v2/hrresignation", payload);
      setMessage(form.id ? "Resignation updated." : "Resignation saved.");
      const saved = res.data.data;
      setForm({
        id: saved._id,
        employeeid: saved.employeeid,
        resignationdate: dateValue(saved.resignationdate),
        noticeperiod: saved.noticeperiod || "",
        lastworkingdate: dateValue(saved.lastworkingdate),
        status: saved.status || "Notice Period",
        remarks: saved.remarks || ""
      });
      setSelectedEmployee(saved);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save resignation");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setSelectedEmployee(row);
    setForm({
      id: row._id,
      employeeid: row.employeeid,
      resignationdate: dateValue(row.resignationdate),
      noticeperiod: row.noticeperiod || "",
      lastworkingdate: dateValue(row.lastworkingdate),
      status: row.status || "Notice Period",
      remarks: row.remarks || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this resignation record?")) return;
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/hrresignation/delete", { id: row._id, colid });
      setMessage("Resignation deleted.");
      if (form.id === row._id) resetForm();
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to delete resignation");
    }
  };

  const uploadDocument = async () => {
    if (!form.id || !upload.file) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const data = new FormData();
      data.append("id", form.id);
      data.append("colid", colid);
      data.append("user", currentUser || "");
      data.append("documenttype", upload.documenttype);
      data.append("description", upload.description);
      data.append("file", upload.file);
      await ep1.post("/api/v2/hrresignation/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage("Document uploaded.");
      setUpload({ documenttype: "Resignation Letter", description: "", file: null });
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to upload document");
    } finally {
      setSaving(false);
    }
  };

  const employeeColumns = [
    { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "department", headerName: "Department", minWidth: 160 },
    { field: "admissionyear", headerName: "Admission year", minWidth: 150 },
    { field: "role", headerName: "Role", minWidth: 130 },
    {
      field: "select",
      headerName: "Select",
      width: 110,
      sortable: false,
      renderCell: (params) => <Button size="small" onClick={() => selectEmployee(params.row)}>Select</Button>
    }
  ];

  const resignationColumns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<Edit />} onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="error" startIcon={<Delete />} onClick={() => deleteRow(params.row)}>Delete</Button>
        </Stack>
      )
    },
    { field: "name", headerName: "Employee", minWidth: 180, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "department", headerName: "Department", minWidth: 160 },
    { field: "admissionyear", headerName: "Admission year", minWidth: 150 },
    { field: "status", headerName: "Status", minWidth: 140 },
    { field: "resignationdate", headerName: "Resignation date", minWidth: 160, valueGetter: (params) => dateValue(params.row.resignationdate) },
    { field: "noticeperiod", headerName: "Notice period", minWidth: 140 },
    { field: "lastworkingdate", headerName: "Last working date", minWidth: 160, valueGetter: (params) => dateValue(params.row.lastworkingdate) },
    { field: "remarks", headerName: "Remarks", minWidth: 220, flex: 1 },
    {
      field: "documents",
      headerName: "Documents",
      minWidth: 260,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {(params.row.documents || []).map((doc, index) => (
            <Chip
              key={`${doc.url}-${index}`}
              label={doc.documenttype || doc.originalname || `Document ${index + 1}`}
              component="a"
              href={doc.url}
              target="_blank"
              clickable
              size="small"
            />
          ))}
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Resignation">
      <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Resignation</Typography>
          <Typography variant="body2" color="text.secondary">Search employee records, save resignation details, and attach resignation documents.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Employee search</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select label="Department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
              <MenuItem value="">All</MenuItem>
              {options.departments.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Admission year</InputLabel>
            <Select label="Admission year" value={filters.admissionyear} onChange={(e) => setFilters({ ...filters, admissionyear: e.target.value })}>
              <MenuItem value="">All</MenuItem>
              {options.admissionyears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select label="Role" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
              <MenuItem value="">All</MenuItem>
              {options.roles.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField size="small" label="Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          <TextField size="small" label="Email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
          <TextField size="small" label="Phone" value={filters.phone} onChange={(e) => setFilters({ ...filters, phone: e.target.value })} />
          <TextField size="small" label="Reg no / employee id" value={filters.regno} onChange={(e) => setFilters({ ...filters, regno: e.target.value })} />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<Search />} onClick={loadEmployees}>Search</Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => { setFilters({ department: "", admissionyear: "", name: "", email: "", phone: "", regno: "", role: "" }); }}>Clear</Button>
          </Stack>
        </Box>
        <Box sx={{ mt: 2, overflowX: "auto" }}>
          <DataGrid
            rows={employees.map((row) => ({ ...row, id: row._id }))}
            columns={employeeColumns}
            autoHeight
            density="compact"
            slots={{ toolbar: GridToolbar }}
            sx={{ minWidth: 1100 }}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Resignation details</Typography>
        {selectedEmployee && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Selected employee: {selectedEmployee.name} {selectedEmployee.email ? `(${selectedEmployee.email})` : ""}
          </Alert>
        )}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
          <TextField size="small" label="Resignation date" type="date" value={form.resignationdate} onChange={(e) => setForm({ ...form, resignationdate: e.target.value })} InputLabelProps={{ shrink: true }} required />
          <TextField size="small" label="Notice period" type="number" value={form.noticeperiod} onChange={(e) => setForm({ ...form, noticeperiod: e.target.value })} />
          <TextField size="small" label="Last working date" type="date" value={form.lastworkingdate} onChange={(e) => setForm({ ...form, lastworkingdate: e.target.value })} InputLabelProps={{ shrink: true }} />
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField size="small" label="Remarks" multiline minRows={2} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} sx={{ gridColumn: { xs: "1", md: "span 4" } }} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" startIcon={<Save />} disabled={saving || !form.employeeid || !form.resignationdate} onClick={saveResignation}>{form.id ? "Update" : "Save"}</Button>
          <Button variant="outlined" onClick={resetForm}>New</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Upload documents</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px 1fr 1fr auto" }, gap: 2, alignItems: "center" }}>
          <FormControl fullWidth size="small">
            <InputLabel>Document type</InputLabel>
            <Select label="Document type" value={upload.documenttype} onChange={(e) => setUpload({ ...upload, documenttype: e.target.value })}>
              {documentTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField size="small" label="Description" value={upload.description} onChange={(e) => setUpload({ ...upload, description: e.target.value })} />
          <Button component="label" variant="outlined" startIcon={<CloudUpload />}>
            {upload.file ? upload.file.name : "Choose file"}
            <input hidden type="file" onChange={(e) => setUpload({ ...upload, file: e.target.files?.[0] || null })} />
          </Button>
          <Button variant="contained" disabled={saving || !form.id || !upload.file} onClick={uploadDocument}>Upload</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, overflowX: "auto" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Resignation records</Typography>
          <Button startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
        </Stack>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          columns={resignationColumns}
          autoHeight
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          sx={{ minWidth: 1800 }}
        />
      </Paper>
      </Container>
    </MenuPageShell>
  );
};

export default HrResignationPage;
