import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { ArrowBack, Delete, Download, Refresh, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const uploadFields = [
  "academicyear",
  "semester",
  "program",
  "programcode",
  "regulation",
  "course",
  "coursecode",
  "major",
  "subject",
  "student",
  "regno",
  "internalmarks",
  "externalmarks",
  "total",
  "grade",
  "gradepoint",
  "zscore",
  "credits",
  "gpa",
  "passstatus",
  "attempt",
  "failmode",
  "grademode"
];

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

const chartColors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d", "#ea580c", "#4f46e5"];

const normalPdf = (x, mean, sd) => {
  if (!sd) return 0;
  return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / sd) ** 2);
};

const binomialPmfAt = (k, n, p) => {
  if (n <= 0 || p <= 0 || p >= 1) return 0;
  const rounded = Math.max(0, Math.min(n, Math.round(k)));
  let probability = (1 - p) ** n;
  for (let i = 1; i <= rounded; i += 1) {
    probability *= ((n - i + 1) / i) * (p / (1 - p));
  }
  return probability;
};

export default function NepLmsFinalMarksViewPage() {
  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    academicyear: "",
    semester: "",
    programcode: "",
    coursecode: "",
    passstatus: ""
  });
  const [relativeForm, setRelativeForm] = useState({
    academicyear: "",
    regulation: "",
    program: "",
    programcode: "",
    course: "",
    coursecode: ""
  });
  const [relativeStats, setRelativeStats] = useState(null);
  const [bulkUpdate, setBulkUpdate] = useState({
    regulation: "",
    program: ""
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadMarks();
  }, []);

  const options = useMemo(() => ({
    academicyear: uniqueSorted(allRows.map((row) => row.academicyear)),
    semester: uniqueSorted(allRows.filter((row) => !filters.academicyear || row.academicyear === filters.academicyear).map((row) => row.semester)),
    programcode: uniqueSorted(allRows.map((row) => row.programcode)),
    coursecode: uniqueSorted(allRows
      .filter((row) => (!filters.academicyear || row.academicyear === filters.academicyear) && (!filters.semester || row.semester === filters.semester))
      .map((row) => row.coursecode)),
    passstatus: uniqueSorted(allRows.map((row) => row.passstatus))
  }), [allRows, filters.academicyear, filters.semester]);

  const relativeOptions = useMemo(() => {
    const yearRows = allRows.filter((row) => !relativeForm.academicyear || row.academicyear === relativeForm.academicyear);
    const regulationRows = yearRows.filter((row) => !relativeForm.regulation || row.regulation === relativeForm.regulation);
    const programRows = regulationRows.filter((row) => !relativeForm.programcode || row.programcode === relativeForm.programcode);
    return {
      academicyears: uniqueSorted(allRows.map((row) => row.academicyear)),
      regulations: uniqueSorted(yearRows.map((row) => row.regulation)),
      programs: (() => {
        const map = new Map();
        regulationRows.forEach((row) => {
          if (row.programcode) map.set(row.programcode, { program: row.program || row.programcode, programcode: row.programcode });
        });
        return [...map.values()].sort((a, b) => String(a.program).localeCompare(String(b.program), undefined, { numeric: true }));
      })(),
      courses: (() => {
        const map = new Map();
        programRows.forEach((row) => {
          if (row.coursecode) map.set(row.coursecode, { course: row.course || row.coursecode, coursecode: row.coursecode });
        });
        return [...map.values()].sort((a, b) => String(a.course).localeCompare(String(b.course), undefined, { numeric: true }));
      })()
    };
  }, [allRows, relativeForm.academicyear, relativeForm.regulation, relativeForm.programcode]);

  const loadMarks = async (overrideFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(overrideFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/neplms/final-marks", { params });
      const data = res.data?.data || [];
      setRows(data);
      if (!Object.values(overrideFilters).some(Boolean)) setAllRows(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load final marks");
    } finally {
      setLoading(false);
    }
  };

  const changeFilter = (field, value) => {
    const next = { ...filters, [field]: value };
    if (field === "academicyear") {
      next.semester = "";
      next.coursecode = "";
    }
    if (field === "semester") next.coursecode = "";
    setFilters(next);
    loadMarks(next);
  };

  const clearFilters = () => {
    const empty = {
      academicyear: "",
      semester: "",
      programcode: "",
      coursecode: "",
      passstatus: ""
    };
    setFilters(empty);
    loadMarks(empty);
  };

  const bulkUpdateField = async (field) => {
    const required = ["academicyear", "programcode", "coursecode"].filter((key) => !filters[key]);
    if (required.length) {
      setError(`Select ${required.join(", ")} before bulk updating ${field}`);
      return;
    }
    const value = String(bulkUpdate[field] || "").trim();
    if (!value) {
      setError(`Enter ${field} value to update`);
      return;
    }
    const ok = window.confirm(`Update ${field} to "${value}" for Academic Year ${filters.academicyear}, Program Code ${filters.programcode}, Course Code ${filters.coursecode}?`);
    if (!ok) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/final-marks/bulk-update-field", {
        colid: global1.colid,
        user: global1.user,
        academicyear: filters.academicyear,
        programcode: filters.programcode,
        coursecode: filters.coursecode,
        field,
        value
      });
      setMessage(`${res.data?.message || `${field} updated`}. Matched: ${res.data?.matched || 0}, Modified: ${res.data?.modified || 0}`);
      await loadMarks(filters);
      setAllRows((prev) => prev.map((row) => (
        row.academicyear === filters.academicyear && row.programcode === filters.programcode && row.coursecode === filters.coursecode
          ? { ...row, [field]: value }
          : row
      )));
      setBulkUpdate((prev) => ({ ...prev, [field]: "" }));
    } catch (err) {
      setError(err.response?.data?.message || `Unable to bulk update ${field}`);
    } finally {
      setLoading(false);
    }
  };

  const updateRelativeForm = (field, value) => {
    setRelativeStats(null);
    setRelativeForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "academicyear") {
        next.regulation = "";
        next.program = "";
        next.programcode = "";
        next.course = "";
        next.coursecode = "";
      }
      if (field === "regulation") {
        next.program = "";
        next.programcode = "";
        next.course = "";
        next.coursecode = "";
      }
      if (field === "programcode") {
        const selected = relativeOptions.programs.find((item) => item.programcode === value);
        next.program = selected?.program || "";
        next.course = "";
        next.coursecode = "";
      }
      if (field === "coursecode") {
        const selected = relativeOptions.courses.find((item) => item.coursecode === value);
        next.course = selected?.course || "";
      }
      return next;
    });
  };

  const processRelativeGrading = async () => {
    const missing = Object.entries(relativeForm).filter(([, value]) => !value).map(([key]) => key);
    if (missing.length) {
      setError(`Select all relative grading fields: ${missing.join(", ")}`);
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/final-marks/process-relative-grading", {
        colid: global1.colid,
        user: global1.user,
        ...relativeForm
      });
      setRelativeStats(res.data);
      setMessage(`${res.data?.message || "Relative grading processed"}. Updated rows: ${res.data?.count || 0}`);
      await loadMarks(filters);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process relative grading");
    } finally {
      setLoading(false);
    }
  };

  const processAutomaticZScoreGrading = async () => {
    const missing = Object.entries(relativeForm).filter(([, value]) => !value).map(([key]) => key);
    if (missing.length) {
      setError(`Select all z-score grading fields: ${missing.join(", ")}`);
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/final-marks/process-automatic-zscore-grading", {
        colid: global1.colid,
        user: global1.user,
        ...relativeForm
      });
      setRelativeStats(res.data);
      setMessage(`${res.data?.message || "Automatic z-score grading processed"}. Updated rows: ${res.data?.count || 0}`);
      await loadMarks(filters);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process automatic z-score grading");
    } finally {
      setLoading(false);
    }
  };

  const processUgcGradeScale = async () => {
    const missing = Object.entries(relativeForm).filter(([, value]) => !value).map(([key]) => key);
    if (missing.length) {
      setError(`Select all UGC grading fields: ${missing.join(", ")}`);
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/final-marks/process-ugc-grade-scale", {
        colid: global1.colid,
        user: global1.user,
        ...relativeForm
      });
      setRelativeStats(res.data);
      setMessage(`${res.data?.message || "UGC grade scale processed"}. Updated rows: ${res.data?.count || 0}`);
      await loadMarks(filters);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process UGC grade scale");
    } finally {
      setLoading(false);
    }
  };

  const processConfiguredGradeScale = async () => {
    const missing = Object.entries(relativeForm).filter(([, value]) => !value).map(([key]) => key);
    if (missing.length) {
      setError(`Select all configured grading fields: ${missing.join(", ")}`);
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/final-marks/process-configured-grade-scale", {
        colid: global1.colid,
        user: global1.user,
        ...relativeForm
      });
      setRelativeStats(res.data);
      setMessage(`${res.data?.message || "Configured grade scale processed"}. Updated rows: ${res.data?.count || 0}`);
      await loadMarks(filters);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process configured grade scale");
    } finally {
      setLoading(false);
    }
  };

  const processConfiguredZScoreScale = async () => {
    const missing = Object.entries(relativeForm).filter(([, value]) => !value).map(([key]) => key);
    if (missing.length) {
      setError(`Select all configured z-score fields: ${missing.join(", ")}`);
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/final-marks/process-configured-zscore-scale", {
        colid: global1.colid,
        user: global1.user,
        ...relativeForm
      });
      setRelativeStats(res.data);
      setMessage(`${res.data?.message || "Configured z score scale processed"}. Updated rows: ${res.data?.count || 0}`);
      await loadMarks(filters);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process configured z score scale");
    } finally {
      setLoading(false);
    }
  };

  const deleteRow = async (row) => {
    const ok = window.confirm(`Delete final marks for ${row.student || row.regno}?`);
    if (!ok) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/neplms/final-marks/delete", {
        id: row._id,
        colid: global1.colid
      });
      setRows((prev) => prev.filter((item) => item._id !== row._id));
      setAllRows((prev) => prev.filter((item) => item._id !== row._id));
      setMessage("Final marks entry deleted");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete final marks");
    } finally {
      setLoading(false);
    }
  };

  const bulkDeleteRows = async () => {
    if (!selectedIds.length) {
      setError("Select at least one row to delete");
      return;
    }
    const ok = window.confirm(`Delete ${selectedIds.length} selected final marks row(s)?`);
    if (!ok) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/final-marks/bulk-delete", {
        colid: global1.colid,
        ids: selectedIds
      });
      const selectedSet = new Set(selectedIds);
      setRows((prev) => prev.filter((row) => !selectedSet.has(row._id)));
      setAllRows((prev) => prev.filter((row) => !selectedSet.has(row._id)));
      setSelectedIds([]);
      setMessage(`Deleted ${res.data?.deleted || 0} selected final marks row(s)`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk delete final marks");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const sample = [{
      academicyear: "2026-27",
      semester: "1",
      program: "B.Com",
      programcode: "BCOM",
      regulation: "NEP 2026",
      course: "Financial Accounting",
      coursecode: "BCOM101",
      major: "Commerce",
      subject: "Commerce",
      student: "Student Name",
      regno: "REG0001",
      internalmarks: 25,
      externalmarks: 60,
      total: 85,
      grade: "A+",
      gradepoint: 9,
      zscore: 1.25,
      credits: 4,
      gpa: 36,
      passstatus: "Pass",
      attempt: 1,
      failmode: "Any Component",
      grademode: "UGC"
    }];
    const ws = XLSX.utils.json_to_sheet(sample, { header: uploadFields });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Final Marks");
    XLSX.writeFile(wb, "NEP_LMS_Final_Marks_Template.xlsx");
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
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" }).map(normalizeUploadRow);
        if (!jsonRows.length) {
          setError("No data found in selected Excel file");
          return;
        }
        const res = await ep1.post("/api/v2/neplms/final-marks/bulk-upload", {
          colid: global1.colid,
          user: global1.user,
          rows: jsonRows
        });
        const uploadErrors = res.data?.errors || [];
        setMessage(`${res.data?.message || "Bulk upload completed"}${uploadErrors.length ? ` First issue: row ${uploadErrors[0].row} - ${uploadErrors[0].message}` : ""}`);
        await loadMarks(filters);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to upload final marks");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "program", headerName: "Program", width: 190 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 160 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "major", headerName: "Major", width: 170 },
    { field: "subject", headerName: "Subject", width: 170 },
    { field: "student", headerName: "Student", width: 190 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "internalmarks", headerName: "Internal Marks", width: 140, type: "number" },
    { field: "externalmarks", headerName: "External Marks", width: 140, type: "number" },
    { field: "total", headerName: "Total", width: 110, type: "number" },
    { field: "grade", headerName: "Grade", width: 100 },
    { field: "gradepoint", headerName: "Grade Point", width: 130, type: "number" },
    { field: "zscore", headerName: "Z Score", width: 110, type: "number" },
    { field: "credits", headerName: "Credits", width: 110, type: "number" },
    { field: "gpa", headerName: "GPA", width: 110, type: "number" },
    {
      field: "passstatus",
      headerName: "Pass Status",
      width: 130,
      renderCell: (params) => <Chip size="small" color={params.value === "Pass" ? "success" : "error"} label={params.value || "Fail"} />
    },
    { field: "attempt", headerName: "Attempt", width: 110, type: "number" },
    { field: "failmode", headerName: "Fail Rule", width: 170 },
    { field: "grademode", headerName: "Grade Rule", width: 160 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 90,
      getActions: (params) => [
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    }
  ];

  const passCount = rows.filter((row) => row.passstatus === "Pass").length;
  const failCount = rows.filter((row) => row.passstatus === "Fail").length;
  const totalMarks = useMemo(() => rows.map((row) => Number(row.total)).filter((value) => Number.isFinite(value)), [rows]);
  const distributionData = useMemo(() => {
    if (!totalMarks.length) return [];
    const maxMark = Math.max(100, Math.ceil(Math.max(...totalMarks)));
    const binCount = 10;
    const binWidth = Math.max(1, Math.ceil(maxMark / binCount));
    const bins = Array.from({ length: binCount }, (_, index) => {
      const from = index * binWidth;
      const to = index === binCount - 1 ? maxMark : ((index + 1) * binWidth) - 1;
      return { from, to, midpoint: (from + to) / 2, count: 0 };
    });
    totalMarks.forEach((mark) => {
      const index = Math.min(binCount - 1, Math.max(0, Math.floor(mark / binWidth)));
      bins[index].count += 1;
    });
    const mean = totalMarks.reduce((sum, value) => sum + value, 0) / totalMarks.length;
    const variance = totalMarks.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / totalMarks.length;
    const sd = Math.sqrt(variance) || 1;
    const n = Math.max(1, Math.round(maxMark));
    const p = Math.min(0.99, Math.max(0.01, mean / n));
    return bins.map((bin) => ({
      band: `${bin.from}-${bin.to}`,
      count: bin.count,
      normal: Number((normalPdf(bin.midpoint, mean, sd) * totalMarks.length * binWidth).toFixed(2)),
      binomial: Number((binomialPmfAt(bin.midpoint, n, p) * totalMarks.length * binWidth).toFixed(2))
    }));
  }, [totalMarks]);

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>View Final Marks</Typography>
          <Typography variant="body2" color="text.secondary">Final marks generated from componentwise internal and external totals.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Template</Button>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>
            Bulk Upload
            <input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} />
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => loadMarks(filters)}>Reload</Button>
        </Stack>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select label="Academic Year" value={filters.academicyear} onChange={(event) => changeFilter("academicyear", event.target.value)}>
                <MenuItem value="">All</MenuItem>
                {options.academicyear.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select label="Semester" value={filters.semester} onChange={(event) => changeFilter("semester", event.target.value)}>
                <MenuItem value="">All</MenuItem>
                {options.semester.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Program Code</InputLabel>
              <Select label="Program Code" value={filters.programcode} onChange={(event) => changeFilter("programcode", event.target.value)}>
                <MenuItem value="">All</MenuItem>
                {options.programcode.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Course Code</InputLabel>
              <Select label="Course Code" value={filters.coursecode} onChange={(event) => changeFilter("coursecode", event.target.value)}>
                <MenuItem value="">All</MenuItem>
                {options.coursecode.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Pass Status</InputLabel>
              <Select label="Pass Status" value={filters.passstatus} onChange={(event) => changeFilter("passstatus", event.target.value)}>
                <MenuItem value="">All</MenuItem>
                {options.passstatus.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
          <Chip color="primary" label={`Rows: ${rows.length}`} />
          <Chip color="success" label={`Pass: ${passCount}`} />
          <Chip color="error" label={`Fail: ${failCount}`} />
          <Chip color="warning" variant="outlined" label={`Selected: ${selectedIds.length}`} />
          <Button size="small" variant="contained" color="error" disabled={loading || !selectedIds.length} onClick={bulkDeleteRows}>
            Delete Selected
          </Button>
          <Button size="small" variant="outlined" onClick={clearFilters}>Clear Filters</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Bulk Update Final Marks</Typography>
          <Typography variant="body2" color="text.secondary">
            Select Academic Year, Program Code and Course Code above, then update regulation or program for all matching rows.
          </Typography>
        </Stack>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="New Regulation"
              value={bulkUpdate.regulation}
              onChange={(event) => setBulkUpdate((prev) => ({ ...prev, regulation: event.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" disabled={loading} onClick={() => bulkUpdateField("regulation")}>
              Update Regulation
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="New Program"
              value={bulkUpdate.program}
              onChange={(event) => setBulkUpdate((prev) => ({ ...prev, program: event.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" color="secondary" disabled={loading} onClick={() => bulkUpdateField("program")}>
              Update Program
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Process Relative Grading</Typography>
          <Typography variant="body2" color="text.secondary">
            Select one course scope, then process grades using relative bands, z-score bands, UGC scale, or grade configuration.
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select label="Academic Year" value={relativeForm.academicyear} onChange={(event) => updateRelativeForm("academicyear", event.target.value)}>
                <MenuItem value="">Select</MenuItem>
                {relativeOptions.academicyears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Regulation</InputLabel>
              <Select label="Regulation" value={relativeForm.regulation} onChange={(event) => updateRelativeForm("regulation", event.target.value)}>
                <MenuItem value="">Select</MenuItem>
                {relativeOptions.regulations.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <FormControl fullWidth>
              <InputLabel>Program</InputLabel>
              <Select label="Program" value={relativeForm.programcode} onChange={(event) => updateRelativeForm("programcode", event.target.value)}>
                <MenuItem value="">Select</MenuItem>
                {relativeOptions.programs.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <FormControl fullWidth>
              <InputLabel>Course</InputLabel>
              <Select label="Course" value={relativeForm.coursecode} onChange={(event) => updateRelativeForm("coursecode", event.target.value)}>
                <MenuItem value="">Select</MenuItem>
                {relativeOptions.courses.map((item) => <MenuItem key={item.coursecode} value={item.coursecode}>{item.course} ({item.coursecode})</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center" justifyContent="flex-start">
              <Button variant="contained" onClick={processRelativeGrading} disabled={loading} sx={{ minWidth: 240, whiteSpace: "nowrap" }}>
                Process Relative Grading
              </Button>
              <Button variant="outlined" onClick={processAutomaticZScoreGrading} disabled={loading} sx={{ minWidth: 260, whiteSpace: "nowrap" }}>
                Automatic Z Score Grade
              </Button>
              <Button variant="outlined" color="success" onClick={processUgcGradeScale} disabled={loading} sx={{ minWidth: 230, whiteSpace: "nowrap" }}>
                Process UGC Grade
              </Button>
              <Button variant="outlined" color="secondary" onClick={processConfiguredGradeScale} disabled={loading} sx={{ minWidth: 280, whiteSpace: "nowrap" }}>
                Process Configured Grade
              </Button>
              <Button variant="outlined" color="info" onClick={processConfiguredZScoreScale} disabled={loading} sx={{ minWidth: 300, whiteSpace: "nowrap" }}>
                Process Configured Z Score
              </Button>
            </Stack>
          </Grid>
        </Grid>
        {relativeStats && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            {relativeStats.mean !== undefined && <Chip color="primary" label={`Mean: ${relativeStats.mean}`} />}
            {relativeStats.standardDeviation !== undefined && <Chip color="secondary" label={`Standard Deviation: ${relativeStats.standardDeviation}`} />}
            <Chip color="success" label={`Rows: ${relativeStats.count}`} />
            {relativeStats.noConfigCount !== undefined && <Chip color="error" label={`No Config: ${relativeStats.noConfigCount}`} />}
            {relativeStats.minZScore !== undefined && <Chip color="info" label={`Min Z: ${relativeStats.minZScore}`} />}
            {relativeStats.maxZScore !== undefined && <Chip color="info" label={`Max Z: ${relativeStats.maxZScore}`} />}
            {relativeStats.spread !== undefined && <Chip color="warning" label={`Spread: ${relativeStats.spread}`} />}
            {relativeStats.interval !== undefined && <Chip color="warning" label={`Band Width: ${relativeStats.interval}`} />}
            {(relativeStats.bands || []).map((band) => (
              <Chip key={`${band.grade}-${band.label}`} variant="outlined" label={`${band.grade} (${band.gradepoint}): ${band.lower} to ${band.upper}`} />
            ))}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Total Marks Distribution</Typography>
          <Typography variant="body2" color="text.secondary">Histogram, normal curve and binomial distribution update from the selected filters.</Typography>
        </Stack>
        <Box sx={{ width: "100%", height: 340 }}>
          <ResponsiveContainer>
            <ComposedChart data={distributionData} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="band" />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                {distributionData.map((entry, index) => <Cell key={entry.band} fill={chartColors[index % chartColors.length]} />)}
              </Bar>
              <Line type="monotone" dataKey="normal" name="Normal Curve" stroke="#111827" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="binomial" name="Binomial Curve" stroke="#e11d48" strokeWidth={3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={rows}
          getRowId={(row) => row._id}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedIds}
          onRowSelectionModelChange={(nextSelection) => setSelectedIds(nextSelection)}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "final_marks" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
          sx={{ minWidth: 2150 }}
        />
      </Paper>
    </Box>
  );
}
