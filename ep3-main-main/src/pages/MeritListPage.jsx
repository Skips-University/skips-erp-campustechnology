import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import {
  Add,
  Cancel,
  Delete,
  Download,
  Edit,
  Refresh,
  Save,
  Search,
  UploadFile
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";

const academicYearOptions = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];

const fieldConfig = [
  { name: "student", label: "Student" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email" },
  { name: "category", label: "Category", options: ["General", "SC", "ST", "EWS", "PH"] },
  { name: "academicyear", label: "Academic Year", options: academicYearOptions },
  { name: "programname", label: "Program Name" },
  { name: "subjects", label: "Subjects" },
  { name: "externaltheorymarks", label: "External Theory Marks", type: "number" },
  { name: "sscaggregatemarks", label: "Qualifying Marks", type: "number" },
  { name: "tenthmarks", label: "Tenth Marks", type: "number" },
  { name: "englishmarks", label: "English Marks", type: "number" },
  { name: "age", label: "Age", type: "number" },
  { name: "bridgecourserequired", label: "Bridge Course Required", options: ["No", "Yes"] },
  { name: "status", label: "Status", options: ["Applied", "Selected", "Rejected"] }
];

const blankForm = {
  student: "",
  phone: "",
  email: "",
  category: "",
  academicyear: "2026-27",
  programname: "",
  subjects: "",
  externaltheorymarks: "",
  sscaggregatemarks: "",
  tenthmarks: "",
  englishmarks: "",
  age: "",
  bridgecourserequired: "No",
  status: "Applied"
};

const numericFields = new Set([
  "externaltheorymarks",
  "sscaggregatemarks",
  "tenthmarks",
  "englishmarks",
  "age"
]);

const MeritListPage = () => {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadMeritList = async () => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/meritlist", {
        params: {
          colid,
          search,
          status: statusFilter,
          category: categoryFilter,
          programname: programFilter
        }
      });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading merit list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeritList();
  }, [colid]);

  const updateFormValue = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "programname" || name === "subjects") {
        next.bridgecourserequired = getBridgeCourseRequired(next);
      }
      return next;
    });
  };

  const getBridgeCourseRequired = (payload) => {
    const program = String(payload.programname || "").toLowerCase();
    const subjects = String(payload.subjects || "").toLowerCase();
    const hasAccountacy = subjects.includes("accountacy") || subjects.includes("accountancy");
    return program.includes("b.com") && !hasAccountacy ? "Yes" : "No";
  };

  const preparePayload = () => {
    const payload = { ...form, colid };
    numericFields.forEach((field) => {
      payload[field] = payload[field] === "" ? undefined : Number(payload[field]);
    });
    return payload;
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const saveMeritList = async (event) => {
    event.preventDefault();
    if (!colid) {
      setError("College id is not available.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = preparePayload();
      if (editingId) {
        await ep1.post("/api/v2/meritlist/update", { ...payload, id: editingId });
        setMessage("Merit list record updated");
      } else {
        await ep1.post("/api/v2/meritlist", payload);
        setMessage("Merit list record created");
      }
      resetForm();
      await loadMeritList();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving merit list record");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm(
      fieldConfig.reduce((acc, field) => {
        acc[field.name] = row[field.name] ?? "";
        return acc;
      }, {})
    );
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete merit list record for ${row.student || "this student"}?`)) {
      return;
    }

    setError("");
    try {
      await ep1.post("/api/v2/meritlist/delete", { id: row._id });
      setMessage("Merit list record deleted");
      await loadMeritList();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting merit list record");
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "student",
      "phone",
      "email",
      "category",
      "colid",
      "academicyear",
      "programname",
      "externaltheorymarks",
      "qualifyingmarks",
      "tenthmarks",
      "englishmarks",
      "age",
      "subjects",
      "bridgecourserequired",
      "status"
    ];
    const worksheet = XLSX.utils.json_to_sheet([
      {
        student: "Sample Student",
        phone: "9999999999",
        email: "student@example.com",
        category: "General",
        colid,
        academicyear: "2026-27",
        programname: "BCA",
        externaltheorymarks: 80,
        qualifyingmarks: 85,
        tenthmarks: 88,
        englishmarks: 75,
        age: 18,
        subjects: "Accountacy, Economics",
        bridgecourserequired: "No",
        status: "Applied"
      }
    ], { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MeritList");
    XLSX.writeFile(workbook, "meritlist-template.xlsx");
  };

  const uploadExcel = async () => {
    if (!excelFile) {
      setError("Please select an Excel file.");
      return;
    }
    if (!colid) {
      setError("College id is not available.");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);
    formData.append("colid", colid);

    setUploading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/meritlist/bulkupload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setExcelFile(null);
      setMessage(`${res.data.count || 0} merit list records uploaded`);
      await loadMeritList();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error uploading merit list");
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { field: "student", headerName: "Student", minWidth: 170, flex: 1 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "email", headerName: "Email", minWidth: 190, flex: 1 },
    { field: "category", headerName: "Category", width: 130 },
    { field: "colid", headerName: "Col ID", width: 90, type: "number" },
    { field: "academicyear", headerName: "Academic Year", width: 135 },
    { field: "programname", headerName: "Program Name", minWidth: 160, flex: 1 },
    { field: "subjects", headerName: "Subjects", minWidth: 170, flex: 1 },
    { field: "externaltheorymarks", headerName: "External Theory", width: 150, type: "number" },
    { field: "sscaggregatemarks", headerName: "Qualifying Marks", width: 155, type: "number" },
    { field: "tenthmarks", headerName: "Tenth Marks", width: 130, type: "number" },
    { field: "englishmarks", headerName: "English Marks", width: 135, type: "number" },
    { field: "age", headerName: "Age", width: 90, type: "number" },
    { field: "bridgecourserequired", headerName: "Bridge Course", width: 145 },
    { field: "status", headerName: "Status", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton color="primary" size="small" onClick={() => editRow(params.row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" size="small" onClick={() => deleteRow(params.row)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Merit List
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage merit list records for the selected institution
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`Col ID: ${colid || "Not set"}`} color={colid ? "primary" : "warning"} variant="outlined" />
          <Chip label={`${rows.length} records`} variant="outlined" />
        </Stack>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6">{editingId ? "Edit Record" : "Add Record"}</Typography>
              {editingId && (
                <Tooltip title="Cancel edit">
                  <IconButton onClick={resetForm}>
                    <Cancel />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            <Box component="form" onSubmit={saveMeritList}>
              <Grid container spacing={1.5}>
                {fieldConfig.map((field) => (
                  <Grid item xs={12} sm={field.type === "number" ? 6 : 12} key={field.name}>
                    {field.options ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                          name={field.name}
                          label={field.label}
                          value={form[field.name]}
                          onChange={updateFormValue}
                        >
                          {field.name === "category" && <MenuItem value="">None</MenuItem>}
                          {field.options.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        name={field.name}
                        label={field.label}
                        type={field.type || "text"}
                        value={form[field.name]}
                        onChange={updateFormValue}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" startIcon={editingId ? <Save /> : <Add />} disabled={saving}>
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>
                  Clear
                </Button>
              </Stack>
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Bulk Upload
            </Typography>
            <Stack spacing={1.5}>
              <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>
                Download Template
              </Button>
              <Button variant="outlined" component="label" startIcon={<UploadFile />}>
                {excelFile ? excelFile.name : "Choose Excel File"}
                <input
                  hidden
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(event) => setExcelFile(event.target.files?.[0] || null)}
                />
              </Button>
              <Button variant="contained" startIcon={<UploadFile />} onClick={uploadExcel} disabled={uploading}>
                Upload Excel
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                label="Category"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                label="Program"
                value={programFilter}
                onChange={(event) => setProgramFilter(event.target.value)}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Applied">Applied</MenuItem>
                  <MenuItem value="Selected">Selected</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" startIcon={<Search />} onClick={loadMeritList}>
                Filter
              </Button>
              <Tooltip title="Reload">
                <IconButton color="primary" onClick={loadMeritList}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Stack>

            <Box sx={{ height: 620, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } }
                }}
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    csvOptions: { fileName: "meritlist" },
                    printOptions: { disableToolbarButton: false }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MeritListPage;
