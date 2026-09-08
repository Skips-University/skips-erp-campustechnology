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
  program: "",
  programcode: "",
  dayofweek: "Monday",
  periodname: "",
  starttime: "",
  endtime: ""
};

const headerMap = {
  academicyear: "academicyear",
  program: "program",
  programcode: "programcode",
  dayofweek: "dayofweek",
  periodname: "periodname",
  starttime: "starttime",
  endtime: "endtime"
};

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export default function ProgramPeriodSlotPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [options, setOptions] = useState({ academicyears: [], programs: [], daysofweek: [], periodnames: [] });
  const [filters, setFilters] = useState({ academicyear: "", programcode: "", dayofweek: "", periodname: "" });
  const [editingId, setEditingId] = useState("");
  const [uploadRows, setUploadRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const yearOptions = useMemo(() => uniqueSorted([...defaultYears, ...options.academicyears, ...rows.map((row) => row.academicyear)]), [options.academicyears, rows]);
  const dayOptions = useMemo(() => uniqueSorted([...daysOfWeek, ...options.daysofweek, ...rows.map((row) => row.dayofweek)]), [options.daysofweek, rows]);
  const periodOptions = useMemo(() => uniqueSorted([...options.periodnames, ...rows.map((row) => row.periodname)]), [options.periodnames, rows]);
  const programOptions = useMemo(() => {
    const map = new Map();
    [...options.programs, ...rows].forEach((item) => {
      if (item.programcode) map.set(item.programcode, { program: item.program || "", programcode: item.programcode || "" });
    });
    return [...map.values()].sort((a, b) => String(a.program || "").localeCompare(String(b.program || "")) || String(a.programcode || "").localeCompare(String(b.programcode || "")));
  }, [options.programs, rows]);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/program-period-slots/options", { params: { colid } });
    setOptions({
      academicyears: res.data.academicyears || [],
      programs: res.data.programs || [],
      daysofweek: res.data.daysofweek || [],
      periodnames: res.data.periodnames || []
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
      const res = await ep1.get("/api/v2/program-period-slots", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load period configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions().catch((err) => setError(err.response?.data?.message || "Unable to load options"));
    loadRows();
  }, []);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const selectProgram = (programcode) => {
    const selected = programOptions.find((item) => item.programcode === programcode);
    setForm((prev) => ({ ...prev, programcode, program: selected?.program || "" }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const saveRow = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const payload = { ...form, colid, user: global1.user };
      if (editingId) {
        await ep1.post("/api/v2/program-period-slots/update", { ...payload, id: editingId });
        setMessage("Period configuration updated");
      } else {
        await ep1.post("/api/v2/program-period-slots", payload);
        setMessage("Period configuration added");
      }
      resetForm();
      await loadRows();
      await loadOptions();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save period configuration");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      academicyear: row.academicyear || "2026-27",
      program: row.program || "",
      programcode: row.programcode || "",
      dayofweek: row.dayofweek || "Monday",
      periodname: row.periodname || "",
      starttime: row.starttime || "",
      endtime: row.endtime || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete ${row.periodname || "this period"}?`)) return;
    try {
      await ep1.post("/api/v2/program-period-slots/delete", { id: row._id, colid });
      setMessage("Period configuration deleted");
      await loadRows();
      await loadOptions();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete period configuration");
    }
  };

  const downloadTemplate = () => {
    const program = programOptions[0] || {};
    const sample = [{
      "Academic Year": form.academicyear || "2026-27",
      Program: program.program || "",
      "Program Code": program.programcode || "",
      "Day Of Week": "Monday",
      "Period Name": "Period 1",
      "Start Time": "09:00",
      "End Time": "10:00"
    }];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Period Configuration");
    XLSX.writeFile(wb, "Period_Configuration_Template.xlsx");
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const parsed = jsonRows.map((row, index) => {
          const item = { rowNumber: index + 2, colid, user: global1.user };
          Object.entries(row).forEach(([header, value]) => {
            const mapped = headerMap[normalizeHeader(header)];
            if (mapped) item[mapped] = value;
          });
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
    try {
      const res = await ep1.post("/api/v2/program-period-slots/bulk", { colid, user: global1.user, items: uploadRows });
      const errors = res.data.errors || [];
      setMessage(`Inserted ${res.data.inserted || 0} rows${errors.length ? `, ${errors.length} errors` : ""}`);
      setError(errors.length ? errors.map((item) => `Row ${item.rowNumber}: ${item.message}`).join(" | ") : "");
      setUploadRows([]);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
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
    { field: "program", headerName: "Program", width: 220 },
    { field: "programcode", headerName: "Program Code", width: 150 },
    { field: "dayofweek", headerName: "Day Of Week", width: 140 },
    { field: "periodname", headerName: "Period Name", width: 160 },
    { field: "starttime", headerName: "Start Time", width: 130 },
    { field: "endtime", headerName: "End Time", width: 130 }
  ];

  return (
    <MenuPageShell title="Period Configuration">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Period Configuration</Typography>
            <Typography variant="body2" color="text.secondary">Create programwise day and period time slots for NEP LMS.</Typography>
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
              <FormControl fullWidth required>
                <InputLabel>Program</InputLabel>
                <Select label="Program" value={form.programcode} onChange={(e) => selectProgram(e.target.value)}>
                  {programOptions.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.program}{item.programcode ? ` (${item.programcode})` : ""}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth required>
                <InputLabel>Day Of Week</InputLabel>
                <Select label="Day Of Week" value={form.dayofweek} onChange={(e) => setField("dayofweek", e.target.value)}>
                  {dayOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth required label="Period Name" value={form.periodname} onChange={(e) => setField("periodname", e.target.value)} /></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth required type="time" label="Start Time" InputLabelProps={{ shrink: true }} value={form.starttime} onChange={(e) => setField("starttime", e.target.value)} /></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth required type="time" label="End Time" InputLabelProps={{ shrink: true }} value={form.endtime} onChange={(e) => setField("endtime", e.target.value)} /></Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
            <Button type="submit" variant="contained" startIcon={editingId ? <Save /> : <Add />}>{editingId ? "Update" : "Save"}</Button>
            <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>Clear</Button>
            <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Template</Button>
            <Button variant="outlined" component="label" startIcon={<UploadFile />}>Choose Excel<input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} /></Button>
            <Button variant="contained" startIcon={<UploadFile />} onClick={uploadExcelRows} disabled={!uploadRows.length}>Upload {uploadRows.length ? `(${uploadRows.length})` : ""}</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} flexWrap="wrap" useFlexGap>
            <Chip label={`${rows.length} records`} />
            {filterSelect("academicyear", "Academic Year", yearOptions)}
            {filterSelect("programcode", "Program", programOptions.map((item) => item.programcode))}
            {filterSelect("dayofweek", "Day Of Week", dayOptions)}
            {filterSelect("periodname", "Period Name", periodOptions)}
            <Button variant="contained" startIcon={<Refresh />} onClick={() => loadRows()}>Load</Button>
            <Button variant="outlined" onClick={() => { const next = { academicyear: "", programcode: "", dayofweek: "", periodname: "" }; setFilters(next); loadRows(next); }}>Clear</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={rows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "period_configuration" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1200 }}
          />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
