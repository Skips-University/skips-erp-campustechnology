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

const defaultAcademicYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const categoryOptions = ["General", "SC", "ST", "OBC", "EWS", "EBC", "PH", "Sports", "Supernumerary"];
const genderOptions = ["Male", "Female", "Not specified"];

const blankForm = {
  academicyear: "2026-27",
  feebook: "",
  cashbook: "",
  program: "",
  programcode: "",
  regulation: "",
  major: "",
  minor: "",
  IDC: "",
  gender: "",
  Medium: "",
  feegroup: "",
  semester: "1",
  feeeitem: "",
  feecategory: "General",
  studtype: "",
  domicile: "",
  feetype: "",
  classdate: "",
  amount: "",
  refundable: "No",
  refundamount: "",
  status: "Added"
};

function unique(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
}

export default function MFeesConfigPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [academicYears, setAcademicYears] = useState(defaultAcademicYears);
  const [feebooks, setFeebooks] = useState([]);
  const [cashbooks, setCashbooks] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [majors, setMajors] = useState([]);
  const [minors, setMinors] = useState([]);
  const [idcs, setIdcs] = useState([]);
  const [feeFilterOptions, setFeeFilterOptions] = useState({
    academicYears: [],
    programs: [],
    regulations: [],
    majors: [],
    minors: [],
    idcs: [],
    genders: [],
    mediums: [],
    semesters: [],
    statuses: []
  });
  const [form, setForm] = useState(blankForm);
  const [filters, setFilters] = useState({ academicyear: "", programcode: "", regulation: "", major: "", minor: "", IDC: "", gender: "", Medium: "", semester: "", refundable: "", status: "" });
  const [editingId, setEditingId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
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

  const loadOptions = async (params = {}) => {
    try {
      const res = await ep1.get("/api/v2/mfeesconfig/options", { params: { colid, ...params } });
      setAcademicYears(res.data.academicYears || defaultAcademicYears);
      setFeebooks(unique(res.data.feebooks || []));
      setCashbooks(unique(res.data.cashbooks || []));
      setPrograms(res.data.programs || []);
      setRegulations(unique(res.data.regulations || []));
      setMajors(unique(res.data.majors || []));
      setMinors(unique(res.data.minors || []));
      setIdcs(unique(res.data.idcs || []));
      setFeeFilterOptions({
        academicYears: unique(res.data.feeFilterOptions?.academicYears || []),
        programs: res.data.feeFilterOptions?.programs || [],
        regulations: unique(res.data.feeFilterOptions?.regulations || []),
        majors: unique(res.data.feeFilterOptions?.majors || []),
        minors: unique(res.data.feeFilterOptions?.minors || []),
        idcs: unique(res.data.feeFilterOptions?.idcs || []),
        genders: unique(res.data.feeFilterOptions?.genders || []),
        mediums: unique(res.data.feeFilterOptions?.mediums || []),
        semesters: unique(res.data.feeFilterOptions?.semesters || []),
        statuses: unique(res.data.feeFilterOptions?.statuses || [])
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dropdown data");
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
      const res = await ep1.get("/api/v2/mfeesconfig", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fee records");
    } finally {
      setLoading(false);
    }
  };

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const selectProgram = (programcode) => {
    const selected = programs.find((item) => item.programcode === programcode);
    setForm((prev) => ({
      ...prev,
      programcode,
      program: selected?.program || "",
      major: "",
      minor: "",
      IDC: ""
    }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const payload = () => ({
    ...form,
    colid,
    user: global1.user,
    name: global1.name || global1.user,
    status: form.status || "Added"
  });

  const saveRow = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await ep1.post("/api/v2/mfeesconfig/update", { ...payload(), id: editingId });
        setMessage("Fee record updated");
      } else {
        await ep1.post("/api/v2/mfeesconfig", payload());
        setMessage("Fee record added");
      }
      resetForm();
      await loadRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save fee record");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      academicyear: row.academicyear || "2026-27",
      feebook: row.feebook || "",
      cashbook: row.cashbook || "",
      program: row.program || "",
      programcode: row.programcode || "",
      regulation: row.regulation || "",
      major: row.major || "",
      minor: row.minor || "",
      IDC: row.IDC || row.idc || "",
      gender: row.gender || "",
      Medium: row.Medium || row.medium || "",
      feegroup: row.feegroup || "",
      semester: row.semester || "1",
      feeeitem: row.feeeitem || "",
      feecategory: row.feecategory || "General",
      studtype: row.studtype || "",
      domicile: row.domicile || "",
      feetype: row.feetype || "",
      classdate: row.classdate ? String(row.classdate).slice(0, 10) : "",
      amount: row.amount || "",
      refundable: row.refundable || "No",
      refundamount: row.refundamount || "",
      status: row.status || "Added"
    });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete fee item ${row.feeeitem || ""}?`)) return;
    try {
      await ep1.post("/api/v2/mfeesconfig/delete", { id: row._id });
      setMessage("Fee record deleted");
      await loadRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete fee record");
    }
  };

  const bulkDeleteRows = async () => {
    if (!selectedIds.length) {
      setError("Please select at least one fee record to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} selected fee record(s)?`)) return;
    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/mfeesconfig/bulk-delete", { ids: selectedIds });
      setSelectedIds([]);
      setMessage(res.data.message || `Deleted ${res.data.deleted || selectedIds.length} fee record(s)`);
      await loadRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete selected fee records");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const items = json.map((row, index) => ({
        rowNumber: index + 2,
        academicyear: row.academicyear || row["Academic Year"],
        feebook: row.feebook || row["Fee Book"],
        cashbook: row.cashbook || row["Cash Book"],
        program: row.program || row.Program,
        programcode: row.programcode || row["Program Code"],
        regulation: row.regulation || row.Regulation,
        major: row.major || row.Major,
        minor: row.minor || row.Minor,
        IDC: row.IDC || row.idc || row["IDC"],
        gender: row.gender || row.Gender,
        Medium: row.Medium || row.medium || row["Medium"],
        feegroup: row.feegroup || row["Fee Group"],
        semester: row.semester || row.Semester,
        feeeitem: row.feeeitem || row.feeitem || row["Fee Item"],
        feecategory: row.feecategory || row["Fee Category"],
        studtype: row.studtype || row["Student Type"],
        domicile: row.domicile || row.Domicile,
        feetype: row.feetype || row["Fee Type"],
        classdate: row.classdate || row["Due Date"],
        amount: row.amount || row.Amount,
        refundable: row.refundable || row.Refundable || "No",
        refundamount: row.refundamount || row["Refund Amount"],
        status: row.status || "Added"
      }));

      const res = await ep1.post("/api/v2/mfeesconfig/bulkupload", {
        colid,
        user: global1.user,
        name: global1.name || global1.user,
        items
      });
      const inserted = res.data.inserted || 0;
      const errors = res.data.errors || [];
      setMessage(`Bulk upload completed. Inserted ${inserted}${errors.length ? `, errors ${errors.length}` : ""}.`);
      if (errors.length) setError(errors.map((item) => `Row ${item.rowNumber}: ${item.message}`).join(" | "));
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload Excel file");
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "Academic Year",
      "Fee Book",
      "Cash Book",
      "Program",
      "Program Code",
      "Regulation",
      "Major",
      "Minor",
      "IDC",
      "Gender",
      "Medium",
      "Fee Group",
      "Semester",
      "Fee Item",
      "Fee Category",
      "Student Type",
      "Domicile",
      "Fee Type",
      "Due Date",
      "Amount",
      "Refundable",
      "Refund Amount",
      "Status"
    ];
    const sample = {
      "Academic Year": form.academicyear || "2026-27",
      "Fee Book": feebooks[0] || "",
      "Cash Book": cashbooks[0] || "",
      Program: programs[0]?.program || "",
      "Program Code": programs[0]?.programcode || "",
      Regulation: form.regulation || regulations[0] || "",
      Major: majors[0] || "",
      Minor: minors[0] || "",
      IDC: idcs[0] || "",
      Gender: "Not specified",
      Medium: "",
      "Fee Group": "Tuition",
      Semester: "1",
      "Fee Item": "Tuition Fee",
      "Fee Category": "General",
      "Student Type": "",
      Domicile: "",
      "Fee Type": "",
      "Due Date": "",
      Amount: 0,
      Refundable: "No",
      "Refund Amount": 0,
      Status: "Added"
    };
    const worksheet = XLSX.utils.json_to_sheet([sample], { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fee Upload");
    XLSX.writeFile(workbook, "mfeesconfig_bulk_upload_template.xlsx");
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "feebook", headerName: "Fee Book", width: 160 },
    { field: "cashbook", headerName: "Cash Book", width: 160 },
    { field: "program", headerName: "Program", width: 220 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 180 },
    { field: "major", headerName: "Major", width: 180 },
    { field: "minor", headerName: "Minor", width: 180 },
    { field: "IDC", headerName: "IDC", width: 180 },
    { field: "gender", headerName: "Gender", width: 140 },
    { field: "Medium", headerName: "Medium", width: 150 },
    { field: "feegroup", headerName: "Fee Group", width: 160 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "feeeitem", headerName: "Fee Item", width: 190 },
    { field: "feecategory", headerName: "Fee Category", width: 140 },
    { field: "studtype", headerName: "Student Type", width: 140 },
    { field: "domicile", headerName: "Domicile", width: 130 },
    { field: "feetype", headerName: "Fee Type", width: 140 },
    { field: "classdate", headerName: "Due Date", width: 130, valueGetter: (params) => (params.value ? String(params.value).slice(0, 10) : "") },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "refundable", headerName: "Refundable", width: 120 },
    { field: "refundamount", headerName: "Refund Amount", width: 140, type: "number" },
    { field: "status", headerName: "Status", width: 120 },
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
          <Typography variant="h5" fontWeight={700}>Fee Configuration</Typography>
          <Typography variant="body2" color="text.secondary">Configure fees by academic year, program, regulation, major and minor</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Dashboard</Button>
          <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Download Template</Button>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>
            Bulk Upload
            <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
          </Button>
          <Chip label={`${rows.length} records`} variant="outlined" />
        </Stack>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">{editingId ? "Edit Fee" : "Add Fee"}</Typography>
              {editingId && <IconButton onClick={resetForm}><Cancel /></IconButton>}
            </Stack>
            <Box component="form" onSubmit={saveRow}>
              <Stack spacing={1.5}>
                <TextField select size="small" label="Academic Year" value={form.academicyear} onChange={(e) => setField("academicyear", e.target.value)} required>
                  {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Fee Book" value={form.feebook} onChange={(e) => setField("feebook", e.target.value)}>
                  {feebooks.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Cash Book" value={form.cashbook} onChange={(e) => setField("cashbook", e.target.value)}>
                  {cashbooks.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Program" value={form.programcode} onChange={(e) => selectProgram(e.target.value)} required>
                  {programs.map((item) => <MenuItem key={item._id || item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Regulation" value={form.regulation} onChange={(e) => setField("regulation", e.target.value)}>
                  {regulations.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Major" value={form.major} onChange={(e) => setField("major", e.target.value)} disabled={!form.regulation || !form.programcode}>
                  {majors.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Minor" value={form.minor} onChange={(e) => setField("minor", e.target.value)} disabled={!form.regulation || !form.programcode}>
                  {minors.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="IDC" value={form.IDC} onChange={(e) => setField("IDC", e.target.value)} disabled={!form.regulation || !form.programcode}>
                  <MenuItem value="">Not Applicable</MenuItem>
                  {idcs.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Gender" value={form.gender} onChange={(e) => setField("gender", e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {genderOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Medium" value={form.Medium} onChange={(e) => setField("Medium", e.target.value)} />
                <TextField size="small" label="Fee Group" value={form.feegroup} onChange={(e) => setField("feegroup", e.target.value)} required />
                <TextField select size="small" label="Semester" value={form.semester} onChange={(e) => setField("semester", e.target.value)} required>
                  {semesterOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Fee Item" value={form.feeeitem} onChange={(e) => setField("feeeitem", e.target.value)} required />
                <TextField select size="small" label="Fee Category" value={form.feecategory} onChange={(e) => setField("feecategory", e.target.value)} required>
                  {categoryOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Student Type" value={form.studtype} onChange={(e) => setField("studtype", e.target.value)} />
                <TextField size="small" label="Domicile" value={form.domicile} onChange={(e) => setField("domicile", e.target.value)} />
                <TextField size="small" label="Fee Type" value={form.feetype} onChange={(e) => setField("feetype", e.target.value)} />
                <TextField size="small" type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={form.classdate} onChange={(e) => setField("classdate", e.target.value)} />
                <TextField size="small" type="number" label="Amount" value={form.amount} onChange={(e) => setField("amount", e.target.value)} required />
                <TextField select size="small" label="Refundable" value={form.refundable} onChange={(e) => setField("refundable", e.target.value)}>
                  <MenuItem value="No">No</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                </TextField>
                <TextField size="small" type="number" label="Refund Amount" value={form.refundamount} onChange={(e) => setField("refundamount", e.target.value)} />
                <TextField size="small" label="Status" value={form.status} onChange={(e) => setField("status", e.target.value)} />
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
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Academic Year</InputLabel>
                <Select label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters((prev) => ({ ...prev, academicyear: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {feeFilterOptions.academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Program</InputLabel>
                <Select label="Program" value={filters.programcode} onChange={(e) => setFilters((prev) => ({ ...prev, programcode: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {feeFilterOptions.programs.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Regulation</InputLabel>
                <Select label="Regulation" value={filters.regulation} onChange={(e) => setFilters((prev) => ({ ...prev, regulation: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {feeFilterOptions.regulations.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Gender</InputLabel>
                <Select label="Gender" value={filters.gender} onChange={(e) => setFilters((prev) => ({ ...prev, gender: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {feeFilterOptions.genders.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Medium</InputLabel>
                <Select label="Medium" value={filters.Medium} onChange={(e) => setFilters((prev) => ({ ...prev, Medium: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {feeFilterOptions.mediums.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Major</InputLabel>
                <Select label="Major" value={filters.major} onChange={(e) => setFilters((prev) => ({ ...prev, major: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {feeFilterOptions.majors.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Minor</InputLabel>
                <Select label="Minor" value={filters.minor} onChange={(e) => setFilters((prev) => ({ ...prev, minor: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {feeFilterOptions.minors.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>IDC</InputLabel>
                <Select label="IDC" value={filters.IDC} onChange={(e) => setFilters((prev) => ({ ...prev, IDC: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {feeFilterOptions.idcs.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Semester</InputLabel>
                <Select label="Semester" value={filters.semester} onChange={(e) => setFilters((prev) => ({ ...prev, semester: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {feeFilterOptions.semesters.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Refundable</InputLabel>
                <Select label="Refundable" value={filters.refundable} onChange={(e) => setFilters((prev) => ({ ...prev, refundable: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {feeFilterOptions.statuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={() => loadRows()}>Filter</Button>
              <Button variant="outlined" color="error" startIcon={<Delete />} disabled={!selectedIds.length || loading} onClick={bulkDeleteRows}>
                Delete Selected ({selectedIds.length})
              </Button>
              <Tooltip title="Reload">
                <IconButton color="primary" onClick={() => loadRows()}><Refresh /></IconButton>
              </Tooltip>
            </Stack>

            <Box sx={{ height: 680, width: "100%", overflowX: "auto" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                checkboxSelection
                rowSelectionModel={selectedIds}
                onRowSelectionModelChange={(model) => setSelectedIds(Array.isArray(model) ? model : Array.from(model?.ids || []))}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fee_configuration" } } }}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } },
                  sorting: { sortModel: [{ field: "academicyear", sort: "desc" }, { field: "program", sort: "asc" }] }
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                sx={{ minWidth: 2900 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
