import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Cancel, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const academicYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const semesters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const statuses = ["Active", "Inactive"];
const types = ["Grant-in", "Non Grant"];

const blankForm = {
  academicyear: "2026-27",
  stream: "",
  type: "Grant-in",
  program: "",
  semester: "1",
  subjects: "",
  status: "Active"
};

const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const uniqueSorted = (values) => [...new Set(values.filter((value) => value !== undefined && value !== null && String(value).trim() !== "").map((value) => String(value).trim()))].sort((a, b) => a.localeCompare(b));

const headerMap = {
  academicyear: "academicyear",
  academicyears: "academicyear",
  academicyearname: "academicyear",
  academicYear: "academicyear",
  stream: "stream",
  type: "type",
  granttype: "type",
  program: "program",
  semester: "semester",
  subjects: "subjects",
  subject: "subjects",
  status: "status"
};

export default function AcademicSubjectPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [filters, setFilters] = useState({ academicyear: "", stream: "", type: "", program: "", semester: "", status: "" });
  const [editingId, setEditingId] = useState("");
  const [uploadRows, setUploadRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid };
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/academicsubjects", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const dropdownOptions = useMemo(() => ({
    academicyear: uniqueSorted([...academicYears, ...rows.map((row) => row.academicyear)]),
    stream: uniqueSorted(rows.map((row) => row.stream)),
    type: uniqueSorted([...types, ...rows.map((row) => row.type)]),
    program: uniqueSorted(rows.map((row) => row.program)),
    semester: uniqueSorted([...semesters, ...rows.map((row) => row.semester)]),
    status: statuses
  }), [rows]);

  const updateFormValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const saveRow = async (event) => {
    event.preventDefault();
    try {
      setError("");
      const payload = { ...form, colid, user: global1.user };
      if (editingId) {
        await ep1.post("/api/v2/academicsubjects/update", { ...payload, id: editingId });
        setMessage("Record updated");
      } else {
        await ep1.post("/api/v2/academicsubjects", payload);
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
      academicyear: row.academicyear || "2026-27",
      stream: row.stream || "",
      type: row.type || "Grant-in",
      program: row.program || "",
      semester: row.semester || "1",
      subjects: row.subjects || "",
      status: row.status || "Active"
    });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete ${row.subjects || "record"}?`)) return;
    try {
      setError("");
      await ep1.post("/api/v2/academicsubjects/delete", { id: row._id, colid });
      setMessage("Record deleted");
      await loadRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting record");
    }
  };

  const downloadTemplate = () => {
    const sample = [{
      academicyear: "2026-27",
      stream: "Commerce",
      type: "Grant-in",
      program: "B.Com",
      semester: "1",
      subjects: "Financial Accounting",
      status: "Active"
    }];
    const worksheet = XLSX.utils.json_to_sheet(sample);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Academic Subjects");
    XLSX.writeFile(workbook, "Academic_Subjects_Template.xlsx");
  };

  const handleExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const mapped = json.map((row, index) => {
        const next = { rowNumber: index + 2 };
        Object.entries(row).forEach(([key, value]) => {
          const mappedKey = headerMap[normalizeHeader(key)] || key;
          next[mappedKey] = value;
        });
        return {
          ...next,
          academicyear: next.academicyear || "2026-27",
          type: next.type || "Grant-in",
          status: next.status || "Active"
        };
      });
      setUploadRows(mapped);
      setMessage(`${mapped.length} rows loaded from Excel. Click Upload Loaded Rows to save.`);
    } catch (err) {
      setError("Unable to read Excel file");
    }
  };

  const uploadExcelRows = async () => {
    if (!uploadRows.length) {
      setError("No uploaded rows to save");
      return;
    }
    try {
      setError("");
      const res = await ep1.post("/api/v2/academicsubjects/bulkupload", {
        colid,
        user: global1.user,
        items: uploadRows
      });
      const errors = res.data.errors || [];
      setMessage(`Inserted ${res.data.inserted || 0} rows${errors.length ? `, ${errors.length} rows failed` : ""}`);
      setUploadRows([]);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Error uploading rows");
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", minWidth: 140, flex: 1 },
    { field: "stream", headerName: "Stream", minWidth: 150, flex: 1 },
    { field: "type", headerName: "Type", minWidth: 130, flex: 0.9 },
    { field: "program", headerName: "Program", minWidth: 180, flex: 1.2 },
    { field: "semester", headerName: "Semester", minWidth: 110, flex: 0.7 },
    { field: "subjects", headerName: "Subjects", minWidth: 240, flex: 1.6 },
    { field: "status", headerName: "Status", minWidth: 120, flex: 0.8 },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 190,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<Edit />} onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="error" startIcon={<Delete />} onClick={() => deleteRow(params.row)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Admission Configuration">
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        <Typography variant="h5" fontWeight={800}>Academic Subjects</Typography>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }} component="form" onSubmit={saveRow}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{editingId ? "Edit Subject" : "Add Subject"}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth required label="Academic Year" value={form.academicyear} onChange={(e) => updateFormValue("academicyear", e.target.value)}>
              {dropdownOptions.academicyear.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth required label="Stream" value={form.stream} onChange={(e) => updateFormValue("stream", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth required label="Type" value={form.type} onChange={(e) => updateFormValue("type", e.target.value)}>
              {types.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth required label="Program" value={form.program} onChange={(e) => updateFormValue("program", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth required label="Semester" value={form.semester} onChange={(e) => updateFormValue("semester", e.target.value)}>
              {dropdownOptions.semester.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth required label="Subjects" value={form.subjects} onChange={(e) => updateFormValue("subjects", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Status" value={form.status} onChange={(e) => updateFormValue("status", e.target.value)}>
              {statuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button type="submit" variant="contained" startIcon={editingId ? <Save /> : <Add />}>{editingId ? "Update" : "Add"}</Button>
              {editingId && <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>Cancel Edit</Button>}
              <Button variant="outlined" startIcon={<Refresh />} onClick={() => loadRows()}>Refresh</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={downloadTemplate}>Download Template</Button>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>
            Select Excel
            <input hidden type="file" accept=".xlsx,.xls" onChange={handleExcel} />
          </Button>
          <Button variant="contained" disabled={!uploadRows.length} onClick={uploadExcelRows}>Upload Loaded Rows ({uploadRows.length})</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          {[
            ["academicyear", "Academic Year"],
            ["stream", "Stream"],
            ["type", "Type"],
            ["program", "Program"],
            ["semester", "Semester"],
            ["status", "Status"]
          ].map(([field, label]) => (
            <Grid item xs={12} md={2.2} key={field}>
              <TextField
                select
                fullWidth
                label={label}
                value={filters[field]}
                onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                {(dropdownOptions[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
          ))}
          <Grid item xs={12} md={1}>
            <Button fullWidth variant="contained" sx={{ height: 56 }} onClick={() => loadRows()}>Load</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Subject List</Typography>
          <Typography color="text.secondary">{rows.length} records</Typography>
        </Stack>
        <Box sx={{ height: 580, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick
            sx={{ "& .MuiDataGrid-cell": { whiteSpace: "normal", lineHeight: 1.4 } }}
          />
        </Box>
      </Paper>
    </Container>
    </MenuPageShell>
  );
}
