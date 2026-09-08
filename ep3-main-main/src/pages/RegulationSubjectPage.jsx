import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Autocomplete,
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
import { Add, ArrowBack, Cancel, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const academicYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const subjectTypes = ["Major", "Minor", "AEC", "SEC", "VAC", "IDC"];
const numericSeatFields = [
  { key: "totalseats", label: "Total Seats" },
  { key: "general", label: "General" },
  { key: "sc", label: "SC" },
  { key: "st", label: "ST" },
  { key: "ebc", label: "EBC" },
  { key: "ews", label: "EWS" },
  { key: "ph", label: "PH" },
  { key: "sportsnccnss", label: "Sports/NCC/NSS" },
  { key: "supernumerary", label: "Supernumerary" }
];
const blankForm = {
  regulationid: "",
  regulation: "",
  academicyear: "2026-27",
  program: "",
  programcode: "",
  subject: "",
  type: "Major",
  totalseats: 0,
  general: 0,
  sc: 0,
  st: 0,
  ebc: 0,
  ews: 0,
  ph: 0,
  sportsnccnss: 0,
  supernumerary: 0,
  samestate: "Yes",
  gender: "Other",
  status: "Active"
};

const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const headerMap = {
  regulation: "regulation",
  academicyear: "academicyear",
  academicyear: "academicyear",
  program: "program",
  programcode: "programcode",
  subject: "subject",
  subjects: "subject",
  type: "type",
  totalseats: "totalseats",
  total: "totalseats",
  seats: "totalseats",
  general: "general",
  sc: "sc",
  st: "st",
  ebc: "ebc",
  ews: "ews",
  ph: "ph",
  sportsnccnss: "sportsnccnss",
  sportsnccnssquota: "sportsnccnss",
  supernumerary: "supernumerary",
  samestate: "samestate",
  gender: "gender",
  status: "status"
};

export default function RegulationSubjectPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({
    regulation: "",
    academicyear: "",
    programcode: "",
    type: "",
    status: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadRows, setUploadRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/regulationsubject/options", { params: { colid } });
    setRegulations(res.data.regulations || []);
    setPrograms(res.data.programs || []);
  };

  const loadRows = async (nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const params = { colid };
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/regulationsubject", { params });
      setRows(res.data.data || []);
      setSelectedRows([]);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const updateFormValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectRegulation = (value) => {
    const selected = regulations.find((item) => item.regulation === value);
    setForm((prev) => ({
      ...prev,
      regulation: value,
      regulationid: selected?._id || ""
    }));
  };

  const selectProgram = (value) => {
    const selected = programs.find((item) => item.programcode === value);
    setForm((prev) => ({
      ...prev,
      programcode: selected?.programcode || "",
      program: selected?.program || ""
    }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const saveRow = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, colid, user: global1.user };
      if (editingId) {
        await ep1.post("/api/v2/regulationsubject/update", { ...payload, id: editingId });
        setMessage("Record updated");
      } else {
        await ep1.post("/api/v2/regulationsubject", payload);
        setMessage("Record created");
      }
      resetForm();
      await loadRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving record");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      regulationid: row.regulationid || "",
      regulation: row.regulation || "",
      academicyear: row.academicyear || "2026-27",
      program: row.program || "",
      programcode: row.programcode || "",
      subject: row.subject || "",
      type: row.type || "Major",
      totalseats: row.totalseats || 0,
      general: row.general || 0,
      sc: row.sc || 0,
      st: row.st || 0,
      ebc: row.ebc || 0,
      ews: row.ews || 0,
      ph: row.ph || 0,
      sportsnccnss: row.sportsnccnss || 0,
      supernumerary: row.supernumerary || 0,
      samestate: row.samestate || "Yes",
      gender: row.gender || "Other",
      status: row.status || "Active"
    });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete ${row.subject || "record"}?`)) return;
    try {
      await ep1.post("/api/v2/regulationsubject/delete", { id: row._id });
      setMessage("Record deleted");
      await loadRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting record");
    }
  };

  const bulkDeleteRows = async () => {
    if (!selectedRows.length) {
      setError("Select records to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.length} selected regulation subject record(s)?`)) return;
    try {
      setDeleting(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/regulationsubject/bulk-delete", { colid, ids: selectedRows });
      setMessage(`${res.data.deleted || 0} selected record(s) deleted`);
      setSelectedRows([]);
      await loadRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Bulk delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const buildTemplate = () => {
    const firstRegulation = regulations[0]?.regulation || "";
    const firstProgram = programs[0] || {};
    const row = {
      Regulation: firstRegulation,
      "Academic Year": "2026-27",
      Program: firstProgram.program || "",
      "Program Code": firstProgram.programcode || "",
      Subject: "Subject Name",
      Type: "Major",
      "Total Seats": 60,
      General: 0,
      SC: 0,
      ST: 0,
      EBC: 0,
      EWS: 0,
      PH: 0,
      "Sports NCC NSS": 0,
      Supernumerary: 0,
      "Same State": "Yes",
      Gender: "Other",
      Status: "Active"
    };
    const ws = XLSX.utils.json_to_sheet([row]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Regulation Subjects");
    XLSX.writeFile(wb, "Regulation_Subject_Template.xlsx");
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const parsed = jsonRows.map((row, index) => {
          const item = { rowNumber: index + 2, colid, user: global1.user, status: "Active" };
          Object.entries(row).forEach(([header, value]) => {
            const key = headerMap[normalizeHeader(header)];
            if (key) item[key] = value;
          });
          const regulation = regulations.find((reg) => reg.regulation === item.regulation);
          const program = programs.find((prog) => prog.programcode === item.programcode || prog.program === item.program);
          item.regulationid = regulation?._id || "";
          item.program = item.program || program?.program || "";
          item.programcode = item.programcode || program?.programcode || "";
          item.academicyear = item.academicyear || "2026-27";
          item.type = subjectTypes.includes(item.type) ? item.type : "Major";
          numericSeatFields.forEach(({ key }) => {
            const parsed = Number(item[key] || 0);
            item[key] = Number.isNaN(parsed) ? 0 : parsed;
          });
          item.samestate = ["Yes", "No"].includes(item.samestate) ? item.samestate : "Yes";
          item.gender = ["Male", "Female", "Other"].includes(item.gender) ? item.gender : "Other";
          item.status = item.status || "Active";
          return item;
        });
        setUploadRows(parsed);
        setMessage(`${parsed.length} rows loaded from Excel`);
      } catch (err) {
        setError("Unable to read Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const uploadExcelRows = async () => {
    if (!uploadRows.length) {
      setError("Select Excel file first");
      return;
    }
    try {
      const res = await ep1.post("/api/v2/regulationsubject/bulkupload", {
        colid,
        user: global1.user,
        items: uploadRows
      });
      const errors = res.data.errors || [];
      setMessage(`Inserted ${res.data.inserted || 0} rows${errors.length ? `. Errors: ${errors.map((item) => `Row ${item.rowNumber}: ${item.message}`).join("; ")}` : ""}`);
      setUploadRows([]);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    }
  };

  const columns = [
    { field: "regulation", headerName: "Regulation", width: 220 },
    { field: "academicyear", headerName: "Academic Year", width: 150 },
    { field: "program", headerName: "Program", width: 260 },
    { field: "programcode", headerName: "Program Code", width: 150 },
    { field: "subject", headerName: "Subject", width: 240 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "totalseats", headerName: "Total Seats", width: 120, type: "number" },
    { field: "general", headerName: "General", width: 100, type: "number" },
    { field: "sc", headerName: "SC", width: 90, type: "number" },
    { field: "st", headerName: "ST", width: 90, type: "number" },
    { field: "ebc", headerName: "EBC", width: 90, type: "number" },
    { field: "ews", headerName: "EWS", width: 90, type: "number" },
    { field: "ph", headerName: "PH", width: 90, type: "number" },
    { field: "sportsnccnss", headerName: "Sports/NCC/NSS", width: 150, type: "number" },
    { field: "supernumerary", headerName: "Supernumerary", width: 150, type: "number" },
    { field: "samestate", headerName: "Same State", width: 120 },
    { field: "gender", headerName: "Gender", width: 110 },
    { field: "status", headerName: "Status", width: 120 },
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
    <MenuPageShell title="Regulation Subjects">
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Regulation Subjects</Typography>
          <Typography variant="body2" color="text.secondary">Map regulation, academic year, program and subject type</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Dashboard</Button>
          <Chip label={`Col ID: ${colid || "Not set"}`} variant="outlined" />
          <Chip label={`${rows.length} records`} variant="outlined" />
        </Stack>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">{editingId ? "Edit Record" : "Add Record"}</Typography>
              {editingId && <IconButton onClick={resetForm}><Cancel /></IconButton>}
            </Stack>
            <Box component="form" onSubmit={saveRow}>
              <Stack spacing={1.5}>
                <TextField select fullWidth size="small" label="Regulation" value={form.regulation} onChange={(e) => selectRegulation(e.target.value)} required>
                  {regulations.map((item) => <MenuItem key={item._id} value={item.regulation}>{item.regulation}</MenuItem>)}
                </TextField>
                <TextField select fullWidth size="small" label="Academic Year" value={form.academicyear} onChange={(e) => updateFormValue("academicyear", e.target.value)} required>
                  {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </TextField>
                <Autocomplete
                  size="small"
                  options={programs}
                  value={programs.find((item) => item.programcode === form.programcode) || null}
                  onChange={(_, value) => selectProgram(value?.programcode || "")}
                  getOptionLabel={(option) => option ? `${option.program || ""}${option.programcode ? ` (${option.programcode})` : ""}` : ""}
                  isOptionEqualToValue={(option, value) => option.programcode === value.programcode}
                  renderInput={(params) => <TextField {...params} label="Program" required />}
                />
                <TextField fullWidth size="small" label="Subjects" value={form.subject} onChange={(e) => updateFormValue("subject", e.target.value)} required />
                <TextField select fullWidth size="small" label="Type" value={form.type} onChange={(e) => updateFormValue("type", e.target.value)} required>
                  {subjectTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </TextField>
                <Grid container spacing={1}>
                  {numericSeatFields.map((item) => (
                    <Grid item xs={12} sm={6} key={item.key}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label={item.label}
                        value={form[item.key]}
                        onChange={(e) => updateFormValue(item.key, e.target.value)}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                  ))}
                </Grid>
                <TextField select fullWidth size="small" label="Same State" value={form.samestate} onChange={(e) => updateFormValue("samestate", e.target.value)}>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
                <TextField select fullWidth size="small" label="Gender" value={form.gender} onChange={(e) => updateFormValue("gender", e.target.value)}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
                <TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => updateFormValue("status", e.target.value)}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
                <Stack direction="row" spacing={1}>
                  <Button type="submit" variant="contained" startIcon={editingId ? <Save /> : <Add />}>{editingId ? "Update" : "Create"}</Button>
                  <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>Clear</Button>
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <Button variant="outlined" startIcon={<FileDownload />} onClick={buildTemplate}>Download Template</Button>
              <Button variant="contained" component="label" startIcon={<UploadFile />}>
                Select Excel
                <input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} />
              </Button>
              <Button variant="contained" color="success" onClick={uploadExcelRows} disabled={!uploadRows.length}>Upload {uploadRows.length ? uploadRows.length : ""} Rows</Button>
              <Button variant="contained" color="error" startIcon={<Delete />} onClick={bulkDeleteRows} disabled={deleting || !selectedRows.length}>
                {deleting ? "Deleting..." : `Bulk delete${selectedRows.length ? ` (${selectedRows.length})` : ""}`}
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel>Academic Year</InputLabel>
                <Select label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters((prev) => ({ ...prev, academicyear: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel>Type</InputLabel>
                <Select label="Type" value={filters.type} onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {subjectTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" onClick={() => loadRows()}>Filter</Button>
              <Tooltip title="Reload">
                <IconButton color="primary" onClick={() => loadRows()}><Refresh /></IconButton>
              </Tooltip>
            </Stack>

            <Box sx={{ height: 620, width: "100%", overflowX: "auto" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                checkboxSelection
                rowSelectionModel={selectedRows}
                onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "regulation_subjects" } } }}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } },
                  sorting: { sortModel: [{ field: "academicyear", sort: "asc" }, { field: "program", sort: "asc" }] }
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                sx={{
                  minWidth: 2600,
                  "& .MuiDataGrid-columnHeaderTitle": {
                    whiteSpace: "normal",
                    lineHeight: 1.2
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
    </MenuPageShell>
  );
}
