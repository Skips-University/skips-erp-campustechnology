import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
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
  Typography
} from "@mui/material";
import { Add, ArrowBack, Delete, Print, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const baseFilterOptions = [
  { field: "academicyear", label: "Academic Year" },
  { field: "regulation", label: "Regulation" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "type", label: "Type" },
  { field: "subject", label: "Subject / Major" },
  { field: "semester", label: "Semester" },
  { field: "course", label: "Course" },
  { field: "coursecode", label: "Course Code" },
  { field: "facultyname", label: "Faculty Name" },
  { field: "facultyemail", label: "Faculty Email" },
  { field: "facultydepartment", label: "Department" },
  { field: "status", label: "Status" }
];

const makeFilter = () => ({ id: `${Date.now()}-${Math.random()}`, field: "academicyear", value: "" });
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export default function WorkloadDynamicReportPage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([makeFilter()]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInstitution();
    loadRows();
  }, []);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/workloadassignment", { params: { colid: global1.colid } });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load workload report");
    } finally {
      setLoading(false);
    }
  };

  const valueOptions = (field) => uniqueSorted(rows.map((row) => row[field]));

  const filteredRows = useMemo(() => rows.filter((row) => filters.every((filter) => {
    if (!filter.field || !filter.value) return true;
    return String(row[filter.field] || "").toLowerCase() === String(filter.value).toLowerCase();
  })), [rows, filters]);

  const facultyGroups = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const key = row.facultyemail || row.facultyname || "Unassigned";
      if (!map.has(key)) {
        map.set(key, {
          facultyname: row.facultyname || "Unassigned",
          facultyemail: row.facultyemail || "",
          facultydepartment: row.facultydepartment || "",
          rows: []
        });
      }
      map.get(key).rows.push(row);
    });
    return [...map.values()].sort((a, b) => String(a.facultyname).localeCompare(String(b.facultyname)));
  }, [filteredRows]);

  const summary = useMemo(() => ({
    facultyCount: facultyGroups.length,
    courseCount: filteredRows.length,
    departments: uniqueSorted(filteredRows.map((row) => row.facultydepartment)).length
  }), [filteredRows, facultyGroups]);

  const updateFilter = (id, key, value) => {
    setFilters((prev) => prev.map((item) => item.id === id ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item));
  };

  const removeFilter = (id) => {
    setFilters((prev) => prev.length === 1 ? [makeFilter()] : prev.filter((item) => item.id !== id));
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "type", headerName: "Type", width: 110 },
    { field: "subject", headerName: "Subject", width: 180 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "facultyname", headerName: "Faculty Name", width: 190 },
    { field: "facultyemail", headerName: "Faculty Email", width: 230 },
    { field: "facultydepartment", headerName: "Department", width: 160 },
    { field: "status", headerName: "Status", width: 110 }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body * { visibility: hidden; }
            #workload-print, #workload-print * { visibility: visible; }
            #workload-print { position: absolute; left: 0; top: 0; width: 190mm; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>
      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Dynamic Workload Report</Typography>
          <Typography variant="body2" color="text.secondary">Build filters and print faculty-wise workload assignment.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
        </Stack>
      </Stack>

      {error && <Paper className="no-print" sx={{ p: 2, mb: 2, color: "error.main" }}>{error}</Paper>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Dynamic Filters</Typography>
          <Button startIcon={<Add />} variant="contained" onClick={() => setFilters((prev) => [...prev, makeFilter()])}>Add Filter</Button>
        </Stack>
        <Grid container spacing={2}>
          {filters.map((filter) => (
            <React.Fragment key={filter.id}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Field</InputLabel>
                  <Select label="Field" value={filter.field} onChange={(e) => updateFilter(filter.id, "field", e.target.value)}>
                    {baseFilterOptions.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Value</InputLabel>
                  <Select label="Value" value={filter.value} onChange={(e) => updateFilter(filter.id, "value", e.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    {valueOptions(filter.field).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth color="error" variant="outlined" startIcon={<Delete />} onClick={() => removeFilter(filter.id)} sx={{ height: 56 }}>Remove</Button>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          <Chip label={`Faculty: ${summary.facultyCount}`} />
          <Chip label={`Courses: ${summary.courseCount}`} />
          <Chip label={`Departments: ${summary.departments}`} />
          <Button size="small" startIcon={<Refresh />} onClick={loadRows}>Reload</Button>
        </Stack>
      </Paper>

      <Paper className="no-print" sx={{ p: 1, overflowX: "auto", mb: 2 }}>
        <DataGrid
          rows={filteredRows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "dynamic_workload_report" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 2100 }}
        />
      </Paper>

      <Paper id="workload-print" sx={{ maxWidth: "210mm", mx: "auto", p: 3, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 70, height: 70, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Faculty Wise Workload Assignment</Typography>
        </Stack>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={4}><Chip label={`Faculty: ${summary.facultyCount}`} sx={{ width: "100%" }} /></Grid>
          <Grid item xs={4}><Chip label={`Courses: ${summary.courseCount}`} sx={{ width: "100%" }} /></Grid>
          <Grid item xs={4}><Chip label={`Departments: ${summary.departments}`} sx={{ width: "100%" }} /></Grid>
        </Grid>

        {facultyGroups.map((group) => (
          <Box key={group.facultyemail || group.facultyname} sx={{ mb: 2, breakInside: "avoid" }}>
            <Box sx={{ bgcolor: "#e2e8f0", border: "1px solid #cbd5e1", px: 1, py: 0.75 }}>
              <Typography fontWeight={900}>{group.facultyname} {group.facultyemail ? `(${group.facultyemail})` : ""}</Typography>
              <Typography variant="body2">{group.facultydepartment || "Department not available"} | {group.rows.length} course(s)</Typography>
            </Box>
            <Grid container sx={{ borderLeft: "1px solid #cbd5e1", borderRight: "1px solid #cbd5e1" }}>
              {["Year", "Regulation", "Program", "Type", "Subject", "Sem", "Course Code", "Course"].map((heading, index) => (
                <Grid item xs={index === 7 ? 3 : index === 2 || index === 4 ? 1.8 : 1} key={heading} sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #cbd5e1", px: 0.75, py: 0.5 }}>
                  <Typography variant="caption" fontWeight={900}>{heading}</Typography>
                </Grid>
              ))}
              {group.rows.map((row) => (
                <React.Fragment key={row._id}>
                  {[row.academicyear, row.regulation, row.programcode || row.program, row.type, row.subject, row.semester, row.coursecode, row.course].map((value, index) => (
                    <Grid item xs={index === 7 ? 3 : index === 2 || index === 4 ? 1.8 : 1} key={`${row._id}-${index}`} sx={{ borderBottom: "1px solid #e5e7eb", px: 0.75, py: 0.45 }}>
                      <Typography variant="caption" sx={{ wordBreak: "break-word" }}>{value || "-"}</Typography>
                    </Grid>
                  ))}
                </React.Fragment>
              ))}
            </Grid>
          </Box>
        ))}

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Checked By</Typography></Box></Grid>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Approved By</Typography></Box></Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
