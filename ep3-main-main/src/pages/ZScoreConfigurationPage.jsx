import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Cancel, Delete, Download, Edit, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = {
  academicyear: "",
  regulation: "",
  program: "",
  programcode: "",
  course: "",
  coursecode: "",
  from: 0,
  to: 0,
  grade: "",
  gradepoint: 0
};

const uploadFields = ["academicyear", "regulation", "program", "programcode", "course", "coursecode", "from", "to", "grade", "gradepoint"];
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const normalizeHeader = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const normalizeUploadRow = (row = {}) => {
  const lookup = {};
  Object.entries(row).forEach(([key, value]) => {
    lookup[normalizeHeader(key)] = value;
  });
  return uploadFields.reduce((acc, field) => {
    acc[field] = lookup[normalizeHeader(field)] ?? "";
    return acc;
  }, {});
};

export default function ZScoreConfigurationPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", programcode: "", coursecode: "" });
  const [options, setOptions] = useState({ academicyears: [], regulations: [], programs: [], courses: [], grades: [] });
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  useEffect(() => {
    loadOptions({
      academicyear: form.academicyear,
      regulation: form.regulation,
      programcode: form.programcode
    });
  }, [form.academicyear, form.regulation, form.programcode]);

  const loadOptions = async (optionFilters = {}) => {
    try {
      const params = { colid };
      Object.entries(optionFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/zscoreconfiguration/options", { params });
      setOptions({
        academicyears: res.data.academicyears || [],
        regulations: res.data.regulations || [],
        programs: res.data.programs || [],
        courses: res.data.courses || [],
        grades: res.data.grades || []
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load options");
    }
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid };
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/zscoreconfiguration", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load z score configuration");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(["academicyear", "regulation", "programcode"].includes(field) ? { course: "", coursecode: "" } : {})
    }));
  };

  const selectProgram = (programcode) => {
    const selected = options.programs.find((item) => item.programcode === programcode);
    setForm((prev) => ({ ...prev, programcode: selected?.programcode || "", program: selected?.program || "", course: "", coursecode: "" }));
  };

  const selectCourse = (coursecode) => {
    const selected = options.courses.find((item) => item.coursecode === coursecode);
    setForm((prev) => ({
      ...prev,
      academicyear: selected?.academicyear || prev.academicyear,
      regulation: selected?.regulation || prev.regulation,
      program: selected?.program || prev.program,
      programcode: selected?.programcode || prev.programcode,
      course: selected?.course || "",
      coursecode: selected?.coursecode || ""
    }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const saveRow = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const payload = { ...form, colid, user: global1.user };
      if (editingId) {
        await ep1.post("/api/v2/zscoreconfiguration/update", { ...payload, id: editingId });
        setMessage("Z score configuration updated");
      } else {
        await ep1.post("/api/v2/zscoreconfiguration", payload);
        setMessage("Z score configuration created");
      }
      resetForm();
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save z score configuration");
    } finally {
      setLoading(false);
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      academicyear: row.academicyear || "",
      regulation: row.regulation || "",
      program: row.program || "",
      programcode: row.programcode || "",
      course: row.course || "",
      coursecode: row.coursecode || "",
      from: row.from ?? 0,
      to: row.to ?? 0,
      grade: row.grade || "",
      gradepoint: row.gradepoint ?? 0
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete z score grade ${row.grade}?`)) return;
    try {
      setLoading(true);
      await ep1.post("/api/v2/zscoreconfiguration/delete", { id: row._id, colid });
      setMessage("Z score configuration deleted");
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete z score configuration");
    } finally {
      setLoading(false);
    }
  };

  const changeFilter = (field, value) => {
    const next = { ...filters, [field]: value };
    setFilters(next);
    loadRows(next);
  };

  const downloadTemplate = () => {
    const sample = [
      { academicyear: "2026-27", regulation: "NEP 2026", program: "B.Com", programcode: "BCOM", course: "Financial Accounting", coursecode: "BCOM101", from: -2, to: -1.5, grade: "F", gradepoint: 0 },
      { academicyear: "2026-27", regulation: "NEP 2026", program: "B.Com", programcode: "BCOM", course: "Financial Accounting", coursecode: "BCOM101", from: 1.5, to: 2, grade: "O", gradepoint: 10 }
    ];
    const ws = XLSX.utils.json_to_sheet(sample, { header: uploadFields });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Z Score Config");
    XLSX.writeFile(wb, "Z_Score_Configuration_Template.xlsx");
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        setError("");
        setMessage("");
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" }).map(normalizeUploadRow);
        if (!jsonRows.length) {
          setError("No data found in selected Excel file");
          return;
        }
        const res = await ep1.post("/api/v2/zscoreconfiguration/bulk-upload", { colid, user: global1.user, rows: jsonRows });
        const uploadErrors = res.data?.errors || [];
        setMessage(`${res.data?.message || "Bulk upload completed"}${uploadErrors.length ? ` First issue: row ${uploadErrors[0].row} - ${uploadErrors[0].message}` : ""}`);
        await loadRows();
        await loadOptions();
      } catch (err) {
        setError(err.response?.data?.message || "Unable to upload z score configuration");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredCourses = options.courses.filter((item) => (
    (!form.academicyear || item.academicyear === form.academicyear)
    && (!form.regulation || item.regulation === form.regulation)
    && (!form.programcode || item.programcode === form.programcode)
  ));

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "from", headerName: "From Z Score", width: 140, type: "number" },
    { field: "to", headerName: "To Z Score", width: 140, type: "number" },
    { field: "grade", headerName: "Grade", width: 110 },
    { field: "gradepoint", headerName: "Grade Point", width: 130, type: "number" },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editRow(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Z Score Configuration">
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Z Score Configuration</Typography>
          <Typography variant="body2" color="text.secondary">Configure z-score grade bands course-wise.</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Template</Button>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>
            Bulk Upload
            <input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} />
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => { loadOptions(); loadRows(); }}>Reload</Button>
        </Stack>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper component="form" onSubmit={saveRow} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => updateForm("academicyear", e.target.value)} required>
              {uniqueSorted([...options.academicyears, ...rows.map((row) => row.academicyear)]).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Regulation" value={form.regulation} onChange={(e) => updateForm("regulation", e.target.value)} required>
              {uniqueSorted([...options.regulations, ...rows.map((row) => row.regulation)]).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Program" value={form.programcode} onChange={(e) => selectProgram(e.target.value)} required>
              {options.programs.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Course" value={form.coursecode} onChange={(e) => selectCourse(e.target.value)} required>
              {filteredCourses.map((item) => <MenuItem key={`${item.coursecode}-${item._id}`} value={item.coursecode}>{item.course} ({item.coursecode})</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="number" label="From Z Score" value={form.from} onChange={(e) => updateForm("from", e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="number" label="To Z Score" value={form.to} onChange={(e) => updateForm("to", e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Grade" value={form.grade} onChange={(e) => updateForm("grade", e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="number" label="Grade Point" value={form.gradepoint} onChange={(e) => updateForm("gradepoint", e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} sx={{ height: "100%", alignItems: "center" }}>
              <Button type="submit" variant="contained" startIcon={editingId ? <Save /> : <Add />} disabled={loading}>{editingId ? "Update" : "Add"}</Button>
              {editingId && <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>Cancel</Button>}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          {["academicyear", "regulation", "programcode", "coursecode"].map((field) => (
            <Grid item xs={12} md={3} key={field}>
              <FormControl fullWidth>
                <InputLabel>{field}</InputLabel>
                <Select label={field} value={filters[field]} onChange={(e) => changeFilter(field, e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {uniqueSorted(rows.map((row) => row[field])).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={rows}
          getRowId={(row) => row._id}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "z_score_configuration" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
          sx={{ minWidth: 1500 }}
        />
      </Paper>
    </Box>
    </MenuPageShell>
  );
}
