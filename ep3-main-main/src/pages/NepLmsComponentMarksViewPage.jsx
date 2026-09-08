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
  Switch,
  Stack,
  Typography
} from "@mui/material";
import { ArrowBack, Delete, Refresh, SettingsSuggest } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export default function NepLmsComponentMarksViewPage() {
  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    academicyear: "",
    semester: "",
    coursecode: "",
    assessmentgroup: "",
    scoretype: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [failMode, setFailMode] = useState("Any Component");
  const [useGradeConfiguration, setUseGradeConfiguration] = useState(false);

  useEffect(() => {
    loadMarks();
  }, []);

  const options = useMemo(() => ({
    academicyear: uniqueSorted(allRows.map((row) => row.academicyear)),
    semester: uniqueSorted(allRows.filter((row) => !filters.academicyear || row.academicyear === filters.academicyear).map((row) => row.semester)),
    coursecode: uniqueSorted(allRows
      .filter((row) => (!filters.academicyear || row.academicyear === filters.academicyear) && (!filters.semester || row.semester === filters.semester))
      .map((row) => row.coursecode)),
    assessmentgroup: uniqueSorted(allRows.map((row) => row.assessmentgroup)),
    scoretype: uniqueSorted(allRows.map((row) => row.scoretype))
  }), [allRows, filters.academicyear, filters.semester]);

  const loadMarks = async (overrideFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(overrideFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/neplms/component-marks", { params });
      const data = res.data?.data || [];
      setRows(data);
      if (!Object.values(overrideFilters).some(Boolean)) setAllRows(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load componentwise marks");
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
      coursecode: "",
      assessmentgroup: "",
      scoretype: ""
    };
    setFilters(empty);
    loadMarks(empty);
  };

  const deleteRow = async (row) => {
    const ok = window.confirm(`Delete componentwise marks for ${row.student || row.regno}?`);
    if (!ok) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/neplms/component-marks/delete", {
        id: row._id,
        colid: global1.colid
      });
      setRows((prev) => prev.filter((item) => item._id !== row._id));
      setAllRows((prev) => prev.filter((item) => item._id !== row._id));
      setMessage("Componentwise marks entry deleted");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete componentwise marks");
    } finally {
      setLoading(false);
    }
  };

  const processFinalMarks = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const payload = {
        colid: global1.colid,
        user: global1.user,
        failmode: failMode,
        grademode: useGradeConfiguration ? "Grade Configuration" : "UGC",
        ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
      };
      const res = await ep1.post("/api/v2/neplms/final-marks/process", payload);
      setMessage(`Final marks processed: ${res.data?.processed || 0}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process final marks");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "academicyear",
      "semester",
      "programcode",
      "course",
      "coursecode",
      "major",
      "subject",
      "student",
      "regno",
      "assessmentgroup",
      "grouptype",
      "scoretype",
      "marks",
      "passmarks",
      "credits",
      "passstatus"
    ];
    const sample = {
      academicyear: "2026-27",
      semester: "1",
      programcode: "NA",
      course: "Course Name",
      coursecode: "COURSE101",
      major: "Subject",
      subject: "Subject",
      student: "Student Name",
      regno: "REG001",
      assessmentgroup: "Internal",
      grouptype: "Average",
      scoretype: "Internal",
      marks: 25,
      passmarks: 10,
      credits: 4,
      passstatus: "Pass"
    };
    const ws = XLSX.utils.json_to_sheet([sample], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ComponentMarks");
    XLSX.writeFile(wb, "neplms_component_marks_template.xlsx");
  };

  const uploadBulk = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const data = new FormData();
      data.append("file", file);
      data.append("colid", global1.colid);
      data.append("user", global1.user || "");
      const res = await ep1.post("/api/v2/neplms/component-marks/bulk-upload", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const errors = res.data?.errors || [];
      setMessage(`Bulk upload completed. Saved: ${res.data?.saved || 0}${errors.length ? `, Errors: ${errors.length}` : ""}`);
      if (errors.length) setError(errors.slice(0, 8).map((item) => `Row ${item.rowNumber}: ${item.message}`).join("\n"));
      await loadMarks(filters);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload componentwise marks");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "major", headerName: "Major", width: 170 },
    { field: "subject", headerName: "Subject", width: 170 },
    { field: "student", headerName: "Student", width: 190 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "assessmentgroup", headerName: "Assessment Group", width: 180 },
    { field: "grouptype", headerName: "Group Type", width: 130 },
    { field: "scoretype", headerName: "Score Type", width: 130 },
    { field: "marks", headerName: "Marks", width: 120, type: "number" },
    { field: "passmarks", headerName: "Passmarks", width: 120, type: "number" },
    { field: "credits", headerName: "Credits", width: 110, type: "number" },
    {
      field: "passstatus",
      headerName: "Pass Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          color={params.value === "Pass" ? "success" : "error"}
          label={params.value || "Fail"}
        />
      )
    },
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

  const averageMarks = rows.length
    ? (rows.reduce((sum, row) => sum + (Number(row.marks) || 0), 0) / rows.length).toFixed(2)
    : "0";

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>View Componentwise Marks</Typography>
          <Typography variant="body2" color="text.secondary">Processed marks grouped by assessment group.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => loadMarks(filters)}>Reload</Button>
          <Button variant="outlined" onClick={downloadTemplate}>Download Template</Button>
          <Button variant="contained" component="label" disabled={loading}>
            Bulk Upload
            <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadBulk} />
          </Button>
          <Button component={RouterLink} to="/neplmsfinalmarks" variant="outlined">View Final Marks</Button>
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
              <InputLabel>Course Code</InputLabel>
              <Select label="Course Code" value={filters.coursecode} onChange={(event) => changeFilter("coursecode", event.target.value)}>
                <MenuItem value="">All</MenuItem>
                {options.coursecode.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Assessment Group</InputLabel>
              <Select label="Assessment Group" value={filters.assessmentgroup} onChange={(event) => changeFilter("assessmentgroup", event.target.value)}>
                <MenuItem value="">All</MenuItem>
                {options.assessmentgroup.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Score Type</InputLabel>
              <Select label="Score Type" value={filters.scoretype} onChange={(event) => changeFilter("scoretype", event.target.value)}>
                <MenuItem value="">All</MenuItem>
                {options.scoretype.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
          <Chip color="primary" label={`Rows: ${rows.length}`} />
          <Chip color="success" label={`Average marks: ${averageMarks}`} />
          <Button size="small" variant="outlined" onClick={clearFilters}>Clear Filters</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Pass/Fail Rule</InputLabel>
              <Select label="Pass/Fail Rule" value={failMode} onChange={(event) => setFailMode(event.target.value)}>
                <MenuItem value="Any Component">Consider fail if fails in any component</MenuItem>
                <MenuItem value="External Only">Consider fail if fail in external only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">UGC grade</Typography>
              <Switch checked={useGradeConfiguration} onChange={(event) => setUseGradeConfiguration(event.target.checked)} />
              <Typography variant="body2">Grade configuration</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" startIcon={<SettingsSuggest />} onClick={processFinalMarks} disabled={loading || !rows.length}>
              Process Final Marks
            </Button>
          </Grid>
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
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "componentwise_marks" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
          sx={{ minWidth: 1850 }}
        />
      </Paper>
    </Box>
  );
}
