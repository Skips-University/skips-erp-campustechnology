import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = ["academicyear", "exam", "examcode", "regulation", "program", "programcode", "course", "coursecode", "student", "regno"];
const labels = {
  academicyear: "Academic Year",
  examcode: "Exam Code",
  programcode: "Program Code",
  coursecode: "Course Code",
  regno: "Reg No",
  componenttype: "Component",
  assessmentcomponent: "Assessment Component",
  maxmarks: "Max Marks",
  marksobtained: "Marks Obtained"
};
const blankFilters = Object.fromEntries(filterFields.map((field) => [field, ""]));
const text = (value) => String(value ?? "").trim();

export default function ExamModel2InterimMarksTransferPage() {
  const [filters, setFilters] = useState(blankFilters);
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [selection, setSelection] = useState([]);
  const [processedRows, setProcessedRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadRows(); }, []);

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/examination-model2/component-marks", { params });
      setRows(res.data?.data || []);
      setOptions(res.data?.options || {});
      setSelection([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load component marks.");
    } finally {
      setLoading(false);
    }
  };

  const dynamicOptions = useMemo(() => {
    const merged = { ...options };
    filterFields.forEach((field) => {
      merged[field] = [...new Set([...(merged[field] || []), ...rows.map((row) => row[field])].map(text).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    });
    return merged;
  }, [options, rows]);

  const selectedRows = useMemo(() => rows.filter((row) => selection.includes(row._id)), [rows, selection]);
  const selectedRegnos = useMemo(() => [...new Set(selectedRows.map((row) => row.regno).filter(Boolean))], [selectedRows]);

  const process = async () => {
    if (!selection.length) {
      setError("Select one or more students/component rows before processing.");
      return;
    }
    try {
      setProcessing(true);
      setError("");
      setMessage("");
      const payload = {
        ...filters,
        colid: global1.colid,
        user: global1.user,
        ids: selection,
        regnos: selectedRegnos
      };
      const res = await ep1.post("/api/v2/examination-model2/interim-marks-transfer", payload);
      const errors = res.data?.errors || [];
      setProcessedRows(res.data?.data || []);
      setSummary({ processed: res.data?.processed || 0, errors: errors.length });
      setMessage(`Interim marks transfer completed. Processed: ${res.data?.processed || 0}`);
      if (errors.length) setError(errors.slice(0, 5).map((item) => `${item.key || "Row"}: ${item.message}`).join(" | "));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process interim marks transfer.");
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "exam", headerName: "Exam", width: 150 },
    { field: "examcode", headerName: "Exam Code", width: 130 },
    { field: "regulation", headerName: "Regulation", width: 130 },
    { field: "program", headerName: "Program", width: 170 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "course", headerName: "Course", width: 190 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "student", headerName: "Student", width: 180 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "componenttype", headerName: "Component", width: 120 },
    { field: "assessmentcomponent", headerName: "Assessment Component", width: 190 },
    { field: "maxmarks", headerName: "Max Marks", width: 120, type: "number" },
    { field: "marksobtained", headerName: "Marks Obtained", width: 140, type: "number" },
    { field: "submissionstatus", headerName: "Submission", width: 130 }
  ];

  const previewColumns = [
    "academicyear", "examcode", "programcode", "semester", "coursecode", "student", "regno",
    "theorymarks", "theoryobtained", "theorystatus", "practicaltotal", "practicalmarks", "practicalstatus",
    "vivatotal", "vivaobtained", "overalltotalmarks", "overallobtained", "overallpercentage", "overallgrade", "overallgradepoint", "gpa", "status"
  ].map((field) => ({ field, headerName: labels[field] || field, width: ["student"].includes(field) ? 180 : 140 }));

  return (
    <MenuPageShell title="Interim Marks Transfer">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={950}>Interim Marks Transfer</Typography>
                <Typography color="text.secondary">Group component marks into Theory, Practical and Viva totals and transfer them into Exam Model 2 viva marks.</Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip color="primary" label={`Selected rows: ${selection.length}`} />
                <Chip color="secondary" label={`Students: ${selectedRegnos.length}`} />
                <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={process} disabled={processing || !selection.length}>{processing ? "Processing..." : "Process"}</Button>
              </Stack>
            </Stack>
            {(loading || processing) && <LinearProgress sx={{ mt: 2 }} />}
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              {filterFields.map((field) => (
                <Grid item xs={12} sm={6} md={2.4} key={field}>
                  <TextField select fullWidth size="small" label={labels[field] || field} value={filters[field]} onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}>
                    <MenuItem value="">All</MenuItem>
                    {(dynamicOptions[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                </Grid>
              ))}
              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => loadRows()} disabled={loading} sx={{ height: 40 }}>Apply</Button></Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>Component Marks</Typography>
            <Box sx={{ height: 560 }}>
              <DataGrid
                rows={rows}
                getRowId={(row) => row._id}
                columns={columns}
                loading={loading}
                checkboxSelection
                rowSelectionModel={selection}
                onRowSelectionModelChange={(model) => {
                  if (Array.isArray(model)) setSelection(model);
                  else if (model?.ids instanceof Set) setSelection(model.type === "exclude" ? rows.map((row) => row._id).filter((id) => !model.ids.has(id)) : [...model.ids]);
                }}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "interim_marks_transfer_source" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
          {summary && (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}><Chip color="success" label={`Processed: ${summary.processed}`} /><Chip color={summary.errors ? "warning" : "default"} label={`Errors: ${summary.errors}`} /></Stack>
              <Typography fontWeight={900} sx={{ mb: 1 }}>Processed Preview</Typography>
              <Box sx={{ height: 420 }}><DataGrid rows={processedRows.map((row, index) => ({ ...row, id: `${row.regno}-${row.coursecode}-${index}` }))} columns={previewColumns} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "interim_marks_transfer_preview" } } }} pageSizeOptions={[10, 25, 50, 100]} /></Box>
            </Paper>
          )}
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
