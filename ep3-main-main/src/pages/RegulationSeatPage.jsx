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
import { Add, ArrowBack, Cancel, Delete, Edit, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const defaultAcademicYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const defaultTypes = ["Major", "Minor", "AEC", "SEC", "VAC", "IDC"];
const defaultCategories = ["General", "SC", "ST", "OBC", "EWS", "EBC", "PH", "Sports", "Supernumerary"];

const blankForm = {
  academicyear: "2026-27",
  regulationid: "",
  regulation: "",
  program: "",
  programcode: "",
  subject: "",
  type: "Major",
  category: "General",
  noofseats: 0,
  samestate: "Yes"
};

export default function RegulationSeatPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState(defaultAcademicYears);
  const [types, setTypes] = useState(defaultTypes);
  const [categories, setCategories] = useState(defaultCategories);
  const [form, setForm] = useState(blankForm);
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", programcode: "", type: "", category: "" });
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  useEffect(() => {
    loadSubjects(form.regulation, form.programcode, form.type);
  }, [form.regulation, form.programcode, form.type]);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/regulationseat/options", { params: { colid } });
      setAcademicYears(res.data.academicYears || defaultAcademicYears);
      setTypes(res.data.subjectTypes || defaultTypes);
      setCategories(res.data.categories || defaultCategories);
      setRegulations(res.data.regulations || []);
      setPrograms(res.data.programs || []);
      setSubjects(res.data.subjects || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load options");
    }
  };

  const loadSubjects = async (regulation, programcode, type) => {
    if (!regulation || !programcode || !type) {
      setSubjects([]);
      return;
    }
    try {
      const res = await ep1.get("/api/v2/regulationseat/options", {
        params: { colid, regulation, programcode, type }
      });
      setSubjects(res.data.subjects || []);
    } catch (err) {
      setSubjects([]);
    }
  };

  const loadRows = async (nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const params = { colid };
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/regulationseat", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load records");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const selectRegulation = (value) => {
    const selected = regulations.find((item) => item.regulation === value);
    setForm((prev) => ({
      ...prev,
      regulation: value,
      regulationid: selected?._id || "",
      subject: ""
    }));
  };

  const selectProgram = (value) => {
    const selected = programs.find((item) => item.programcode === value);
    setForm((prev) => ({
      ...prev,
      programcode: selected?.programcode || "",
      program: selected?.program || "",
      subject: ""
    }));
  };

  const selectType = (value) => {
    setForm((prev) => ({ ...prev, type: value, subject: "" }));
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
        await ep1.post("/api/v2/regulationseat/update", { ...payload, id: editingId });
        setMessage("Record updated");
      } else {
        await ep1.post("/api/v2/regulationseat", payload);
        setMessage("Record created");
      }
      resetForm();
      await loadRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save record");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      academicyear: row.academicyear || "2026-27",
      regulationid: row.regulationid || "",
      regulation: row.regulation || "",
      program: row.program || "",
      programcode: row.programcode || "",
      subject: row.subject || "",
      type: row.type || "Major",
      category: row.category || "General",
      noofseats: row.noofseats || 0,
      samestate: row.samestate || "Yes"
    });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete seat record for ${row.subject || "subject"}?`)) return;
    try {
      await ep1.post("/api/v2/regulationseat/delete", { id: row._id });
      setMessage("Record deleted");
      await loadRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete record");
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 220 },
    { field: "program", headerName: "Program", width: 240 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "subject", headerName: "Subject", width: 220 },
    { field: "type", headerName: "Type", width: 110 },
    { field: "category", headerName: "Category", width: 140 },
    { field: "noofseats", headerName: "No of Seats", width: 130, type: "number" },
    { field: "samestate", headerName: "Same State", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
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
          <Typography variant="h5" fontWeight={700}>Regulation Seat Matrix</Typography>
          <Typography variant="body2" color="text.secondary">Maintain category-wise seats by regulation, program, subject and type</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Dashboard</Button>
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
                <TextField select fullWidth size="small" label="Academic Year" value={form.academicyear} onChange={(e) => updateForm("academicyear", e.target.value)} required>
                  {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </TextField>
                <TextField select fullWidth size="small" label="Regulation" value={form.regulation} onChange={(e) => selectRegulation(e.target.value)} required>
                  {regulations.map((item) => <MenuItem key={item._id} value={item.regulation}>{item.regulation}</MenuItem>)}
                </TextField>
                <TextField select fullWidth size="small" label="Program" value={form.programcode} onChange={(e) => selectProgram(e.target.value)} required>
                  {programs.map((item) => <MenuItem key={item._id || item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>)}
                </TextField>
                <TextField select fullWidth size="small" label="Type" value={form.type} onChange={(e) => selectType(e.target.value)} required>
                  {types.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </TextField>
                <TextField select fullWidth size="small" label="Subject" value={form.subject} onChange={(e) => updateForm("subject", e.target.value)} required disabled={!form.regulation || !form.programcode || !form.type}>
                  {subjects.map((item) => <MenuItem key={`${item.subject}-${item._id || item.type}`} value={item.subject}>{item.subject}</MenuItem>)}
                </TextField>
                <TextField select fullWidth size="small" label="Category" value={form.category} onChange={(e) => updateForm("category", e.target.value)} required>
                  {categories.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
                </TextField>
                <TextField fullWidth size="small" type="number" label="No of Seats" value={form.noofseats} onChange={(e) => updateForm("noofseats", e.target.value)} inputProps={{ min: 0 }} />
                <TextField select fullWidth size="small" label="Same State" value={form.samestate} onChange={(e) => updateForm("samestate", e.target.value)}>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
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
          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Academic Year</InputLabel>
                <Select label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters((prev) => ({ ...prev, academicyear: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Type</InputLabel>
                <Select label="Type" value={filters.type} onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {types.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={filters.category} onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {categories.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={() => loadRows()}>Filter</Button>
              <Tooltip title="Reload">
                <IconButton color="primary" onClick={() => loadRows()}><Refresh /></IconButton>
              </Tooltip>
            </Stack>

            <Box sx={{ height: 640, width: "100%", overflowX: "auto" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "regulation_seat_matrix" } } }}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } },
                  sorting: { sortModel: [{ field: "academicyear", sort: "asc" }, { field: "program", sort: "asc" }] }
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                sx={{ minWidth: 1500 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
