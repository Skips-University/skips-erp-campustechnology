import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
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
import { Add, ArrowBack, Cancel, Delete, Download, Edit, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const defaultYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const blankForm = {
  academicyear: "2026-27",
  dayofweek: "Monday",
  starttime: "",
  endtime: "",
  reason: "",
  remarks: ""
};

const headerMap = {
  academicyear: "academicyear",
  facultyname: "facultyname",
  facultyemail: "facultyemail",
  dayofweek: "dayofweek",
  starttime: "starttime",
  endtime: "endtime",
  reason: "reason",
  remarks: "remarks"
};

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
export default function FacultyAvailabilityPage() {
  const colid = useMemo(() => global1.colid, []);
  const facultyName = useMemo(() => global1.name || global1.user || "", []);
  const facultyEmail = useMemo(() => global1.user || global1.email || "", []);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [options, setOptions] = useState({ academicyears: [], faculty: [], daysofweek: [] });
  const [filters, setFilters] = useState({ academicyear: "", facultyemail: "", dayofweek: "" });
  const [editingId, setEditingId] = useState("");
  const [uploadRows, setUploadRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const yearOptions = useMemo(() => uniqueSorted([...defaultYears, ...options.academicyears, ...rows.map((row) => row.academicyear)]), [options.academicyears, rows]);
  const facultyOptions = useMemo(() => {
    const map = new Map();
    [...options.faculty, ...rows].forEach((item) => {
      if (item.facultyemail) map.set(item.facultyemail, { facultyname: item.facultyname || "", facultyemail: item.facultyemail || "" });
    });
    if (facultyEmail && !map.has(facultyEmail)) map.set(facultyEmail, { facultyname: facultyName, facultyemail: facultyEmail });
    return [...map.values()].sort((a, b) => String(a.facultyname || "").localeCompare(String(b.facultyname || "")));
  }, [facultyEmail, facultyName, options.faculty, rows]);
  const dayOptions = useMemo(() => uniqueSorted([...daysOfWeek, ...options.daysofweek, ...rows.map((row) => row.dayofweek)]), [options.daysofweek, rows]);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/faculty-availability/options", { params: { colid } });
    setOptions({
      academicyears: res.data.academicyears || [],
      faculty: res.data.faculty || [],
      daysofweek: res.data.daysofweek || []
    });
  };

  const loadRows = async (nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const params = { colid };
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/faculty-availability", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load faculty availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions().catch((err) => setError(err.response?.data?.message || "Unable to load options"));
    loadRows();
  }, []);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const saveRow = async (event) => {
    event.preventDefault();
    setError("");
    setActionLoading(true);
    try {
      const payload = {
        ...form,
        facultyname: facultyName,
        facultyemail: facultyEmail,
        colid,
        user: global1.user
      };
      if (editingId) {
        await ep1.post("/api/v2/faculty-availability/update", { ...payload, id: editingId });
        setMessage("Faculty availability updated");
      } else {
        await ep1.post("/api/v2/faculty-availability", payload);
        setMessage("Faculty availability added");
      }
      resetForm();
      await loadRows();
      await loadOptions();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save faculty availability");
    } finally {
      setActionLoading(false);
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      academicyear: row.academicyear || "2026-27",
      dayofweek: row.dayofweek || "Monday",
      starttime: row.starttime || "",
      endtime: row.endtime || "",
      reason: row.reason || "",
      remarks: row.remarks || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete unavailable slot on ${row.dayofweek || "this day"}?`)) return;
    setActionLoading(true);
    try {
      await ep1.post("/api/v2/faculty-availability/delete", { id: row._id, colid });
      setMessage("Faculty availability deleted");
      await loadRows();
      await loadOptions();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete faculty availability");
    } finally {
      setActionLoading(false);
    }
  };

  const downloadTemplate = () => {
    const sample = [{
      "Academic Year": form.academicyear || "2026-27",
      "Faculty Name": facultyName,
      "Faculty Email": facultyEmail,
      "Day Of Week": form.dayofweek || "Monday",
      "Start Time": "10:00",
      "End Time": "11:00",
      Reason: "Unavailable",
      Remarks: ""
    }];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculty Availability");
    XLSX.writeFile(wb, "Faculty_Availability_Template.xlsx");
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const parsed = jsonRows.map((row, index) => {
          const item = { rowNumber: index + 2, colid, user: global1.user, facultyname: facultyName, facultyemail: facultyEmail };
          Object.entries(row).forEach(([header, value]) => {
            const mapped = headerMap[normalizeHeader(header)];
            if (mapped) item[mapped] = value;
          });
          if (!item.facultyname) item.facultyname = facultyName;
          if (!item.facultyemail) item.facultyemail = facultyEmail;
          return item;
        });
        setUploadRows(parsed);
        setMessage(`${parsed.length} rows ready for upload`);
      } catch {
        setError("Unable to read Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadExcelRows = async () => {
    if (!uploadRows.length) {
      setError("Please choose an Excel file first");
      return;
    }
    setActionLoading(true);
    try {
      const res = await ep1.post("/api/v2/faculty-availability/bulk", { colid, user: global1.user, items: uploadRows });
      const errors = res.data.errors || [];
      setMessage(`Inserted ${res.data.inserted || 0} rows${errors.length ? `, ${errors.length} errors` : ""}`);
      setError(errors.length ? errors.map((item) => `Row ${item.rowNumber}: ${item.message}`).join(" | ") : "");
      setUploadRows([]);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    } finally {
      setActionLoading(false);
    }
  };

  const filterSelect = (field, label, values) => (
    <FormControl size="small" sx={{ minWidth: 170 }}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={filters[field]} onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}>
        <MenuItem value="">All</MenuItem>
        {values.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
      </Select>
    </FormControl>
  );

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => editRow(row)}><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteRow(row)}><Delete fontSize="small" /></IconButton></Tooltip>
        </Stack>
      )
    },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "facultyname", headerName: "Faculty Name", width: 190 },
    { field: "facultyemail", headerName: "Faculty Email", width: 230 },
    { field: "dayofweek", headerName: "Day Of Week", width: 140 },
    { field: "starttime", headerName: "Start Time", width: 130 },
    { field: "endtime", headerName: "End Time", width: 130 },
    { field: "reason", headerName: "Reason", width: 180 },
    { field: "remarks", headerName: "Remarks", width: 240 }
  ];

  return (
    <MenuPageShell title="Faculty Availability">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Faculty Availability</Typography>
            <Typography variant="body2" color="text.secondary">Mark unavailable days and time slots for timetable and scheduling work.</Typography>
          </Box>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper component="form" onSubmit={saveRow} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth required>
                <InputLabel>Academic Year</InputLabel>
                <Select label="Academic Year" value={form.academicyear} onChange={(e) => setField("academicyear", e.target.value)}>
                  {yearOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Faculty" value={`${facultyName}${facultyEmail ? ` (${facultyEmail})` : ""}`} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth required>
                <InputLabel>Day Of Week</InputLabel>
                <Select label="Day Of Week" value={form.dayofweek} onChange={(e) => setField("dayofweek", e.target.value)}>
                  {dayOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1.5}>
              <TextField fullWidth required type="time" label="Start Time" InputLabelProps={{ shrink: true }} value={form.starttime} onChange={(e) => setField("starttime", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={1.5}>
              <TextField fullWidth required type="time" label="End Time" InputLabelProps={{ shrink: true }} value={form.endtime} onChange={(e) => setField("endtime", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Reason" value={form.reason} onChange={(e) => setField("reason", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={9}>
              <TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setField("remarks", e.target.value)} />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
            <Button type="submit" variant="contained" startIcon={editingId ? <Save /> : <Add />} disabled={actionLoading}>{editingId ? "Update" : "Save"}</Button>
            <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>Clear</Button>
            <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Template</Button>
            <Button variant="outlined" component="label" startIcon={<UploadFile />}>Choose Excel<input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} /></Button>
            <Button variant="contained" startIcon={<UploadFile />} onClick={uploadExcelRows} disabled={!uploadRows.length || actionLoading}>Upload {uploadRows.length ? `(${uploadRows.length})` : ""}</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} flexWrap="wrap" useFlexGap>
            <Chip label={`${rows.length} records`} />
            {filterSelect("academicyear", "Academic Year", yearOptions)}
            {filterSelect("facultyemail", "Faculty", facultyOptions.map((item) => item.facultyemail))}
            {filterSelect("dayofweek", "Day Of Week", dayOptions)}
            <Button variant="contained" startIcon={<Refresh />} onClick={() => loadRows()}>Load</Button>
            <Button variant="outlined" onClick={() => { const next = { academicyear: "", facultyemail: "", dayofweek: "" }; setFilters(next); loadRows(next); }}>Clear</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={rows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "faculty_availability" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1500 }}
          />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
