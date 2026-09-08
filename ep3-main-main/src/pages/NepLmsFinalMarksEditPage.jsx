import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const filterFields = [
  "academicyear",
  "regulation",
  "program",
  "programcode",
  "semester",
  "course",
  "coursecode",
  "major",
  "subject",
  "student",
  "regno",
  "grade",
  "passstatus",
  "attempt",
  "failmode",
  "grademode"
];

const labels = {
  academicyear: "Academic Year",
  regulation: "Regulation",
  program: "Program",
  programcode: "Program Code",
  semester: "Semester",
  course: "Course",
  coursecode: "Course Code",
  major: "Major",
  subject: "Subject",
  student: "Student",
  regno: "Reg No",
  grade: "Grade",
  passstatus: "Pass Status",
  attempt: "Attempt",
  failmode: "Fail Mode",
  grademode: "Grade Mode"
};

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item ?? "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export default function NepLmsFinalMarksEditPage() {
  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [activeFields, setActiveFields] = useState(["academicyear", "programcode", "coursecode"]);
  const [filters, setFilters] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadMarks({});
  }, []);

  const options = useMemo(() => {
    const source = allRows.length ? allRows : rows;
    return filterFields.reduce((acc, field) => {
      acc[field] = uniqueSorted(source.map((row) => row[field]));
      return acc;
    }, {});
  }, [allRows, rows]);

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
      setSelectedIds([]);
      if (!Object.values(overrideFilters).some(Boolean)) setAllRows(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load final marks.");
    } finally {
      setLoading(false);
    }
  };

  const changeActiveFields = (value) => {
    const nextFields = value || [];
    setActiveFields(nextFields);
    setFilters((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => nextFields.includes(key))));
  };

  const changeFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => loadMarks(filters);

  const clearFilters = () => {
    setFilters({});
    loadMarks({});
  };

  const handleSelectionChange = (model) => {
    if (Array.isArray(model)) {
      setSelectedIds(model);
      return;
    }
    if (model?.ids instanceof Set) {
      if (model.type === "exclude") {
        const visibleIds = rows.map((row) => row._id);
        setSelectedIds(visibleIds.filter((id) => !model.ids.has(id)));
      } else {
        setSelectedIds([...model.ids]);
      }
      return;
    }
    setSelectedIds([]);
  };

  const bulkDeleteRows = async () => {
    if (!selectedIds.length) {
      setError("Select at least one final marks row to delete.");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} selected final marks row${selectedIds.length === 1 ? "" : "s"}?`)) return;
    try {
      setDeleting(true);
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
      setMessage(`Deleted ${res.data?.deleted || 0} selected final marks row${res.data?.deleted === 1 ? "" : "s"}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete selected final marks.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 130 },
    { field: "regulation", headerName: "Regulation", width: 140 },
    { field: "program", headerName: "Program", minWidth: 160, flex: 1 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", minWidth: 190, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "major", headerName: "Major", width: 150 },
    { field: "subject", headerName: "Subject", width: 150 },
    { field: "student", headerName: "Student", minWidth: 170, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "internalmarks", headerName: "Internal", width: 110, type: "number" },
    { field: "externalmarks", headerName: "External", width: 110, type: "number" },
    { field: "total", headerName: "Total", width: 100, type: "number" },
    { field: "grade", headerName: "Grade", width: 100 },
    { field: "gradepoint", headerName: "Grade Point", width: 120, type: "number" },
    { field: "zscore", headerName: "Z Score", width: 110, type: "number" },
    { field: "credits", headerName: "Credits", width: 100, type: "number" },
    { field: "gpa", headerName: "GPA", width: 100, type: "number" },
    { field: "passstatus", headerName: "Pass Status", width: 120 },
    { field: "attempt", headerName: "Attempt", width: 100, type: "number" },
    { field: "failmode", headerName: "Fail Mode", width: 180 },
    { field: "grademode", headerName: "Grade Mode", width: 200 }
  ];

  return (
    <MenuPageShell title="Edit Final Marks">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Edit Final Marks</Typography>
              <Typography color="text.secondary">Dynamically filter final marks, select rows, and bulk delete selected entries.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => loadMarks(filters)} disabled={loading || deleting}>Refresh</Button>
              <Button variant="contained" color="error" onClick={bulkDeleteRows} disabled={!selectedIds.length || loading || deleting}>
                {deleting ? "Deleting..." : `Delete Selected${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
              </Button>
            </Stack>
          </Stack>
          {(loading || deleting) && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={filterFields}
                value={activeFields}
                onChange={(event, value) => changeActiveFields(value)}
                getOptionLabel={(option) => labels[option] || option}
                renderInput={(params) => <TextField {...params} label="Add Filter Fields" placeholder="Select fields" />}
              />
            </Grid>
            {activeFields.map((field) => (
              <Grid item xs={12} md={3} key={field}>
                <TextField select fullWidth label={labels[field] || field} value={filters[field] || ""} onChange={(event) => changeFilter(field, event.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={applyFilters} disabled={loading || deleting} sx={{ height: 56 }}>{loading ? "Loading..." : "Apply"}</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={clearFilters} disabled={loading || deleting} sx={{ height: 56 }}>Clear</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => setSelectedIds(rows.map((row) => row._id))} disabled={!rows.length || loading || deleting} sx={{ height: 56 }}>Select All Loaded</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => setSelectedIds([])} disabled={!selectedIds.length || loading || deleting} sx={{ height: 56 }}>Clear Selection</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Rows: {rows.length}</Typography>
            <Typography variant="body2" color="text.secondary">Selected: {selectedIds.length}</Typography>
          </Stack>
          <Box sx={{ height: 650, width: "100%" }}>
            <DataGrid
              rows={rows}
              getRowId={(row) => row._id}
              columns={columns}
              loading={loading}
              checkboxSelection
              rowSelectionModel={selectedIds}
              onRowSelectionModelChange={handleSelectionChange}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "edit_final_marks" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
