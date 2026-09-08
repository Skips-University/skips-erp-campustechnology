import React, { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import RuleIcon from "@mui/icons-material/Rule";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const fields = ["academicyear", "regulation", "exam", "examcode", "program", "programcode", "type", "subject", "semester", "course", "coursecode", "section", "seatno", "atkt"];
const labels = { academicyear: "Academic Year", regulation: "Regulation", exam: "Exam", examcode: "Exam Code", program: "Program", programcode: "Program Code", type: "Type", subject: "Subject", semester: "Semester", course: "Course", coursecode: "Course Code", section: "Section", seatno: "Seat No", atkt: "ATKT" };

export default function ExamrollRulesCheckPage() {
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState([]);
  const [threshold, setThreshold] = useState(75);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadOptions(); loadRows(); }, []);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/conductexam/examroll-rules/options", { params: { colid: global1.colid } });
      setOptions(res.data.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load options");
    }
  };
  const params = () => {
    const next = { colid: global1.colid };
    Object.entries(filters).forEach(([key, value]) => { if (value) next[key] = value; });
    return next;
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/conductexam/examroll-rules/rows", { params: params() });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load examroll");
    } finally {
      setLoading(false);
    }
  };
  const runCheck = async (type) => {
    try {
      setProcessing(type);
      setError("");
      const endpoint = type === "attendance"
        ? "/api/v2/conductexam/examroll-rules/check-attendance"
        : type === "fees"
          ? "/api/v2/conductexam/examroll-rules/check-fees"
          : type === "disciplinary"
            ? "/api/v2/conductexam/examroll-rules/check-disciplinary"
            : "/api/v2/conductexam/examroll-rules/check-backlogs";
      const res = await ep1.post(endpoint, { ...params(), threshold });
      setMessage(`${type} check completed. Updated ${res.data.updated || 0} rows.`);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || `Unable to run ${type} check`);
    } finally {
      setProcessing("");
    }
  };
  const columns = [
    { field: "_id", headerName: "Unique ID", width: 230 },
    { field: "student", headerName: "Student", width: 170 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "academicyear", headerName: "Academic Year", width: 130 },
    { field: "examcode", headerName: "Exam Code", width: 120 },
    { field: "programcode", headerName: "Program Code", width: 130 },
    { field: "semester", headerName: "Semester", width: 100 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "course", headerName: "Course", width: 200 },
    { field: "seatno", headerName: "Seat No", width: 110 },
    { field: "attendance", headerName: "Attendance", width: 140 },
    { field: "fees", headerName: "Fees", width: 150 },
    { field: "disciplinary", headerName: "Disciplinary", width: 170 },
    { field: "noofbacklogs", headerName: "Backlogs", width: 110 },
    { field: "atkt", headerName: "ATKT", width: 100 },
    { field: "admitcardeligible", headerName: "Admit Eligible", width: 130 }
  ];
  return (
    <MenuPageShell title="Examroll Rules Check">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>Examroll Rules Check</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Check attendance, pending fees and open disciplinary actions for exam roll eligibility.</Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid item xs={12} md={3} key={field}>
                <FormControl fullWidth>
                  <InputLabel>{labels[field]}</InputLabel>
                  <Select label={labels[field]} value={filters[field] || ""} onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}>
                    <MenuItem value="">All</MenuItem>
                    {(options[field] || []).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mt: 2 }}>
            <TextField type="number" label="Attendance Threshold %" value={threshold} onChange={(e) => setThreshold(e.target.value)} sx={{ width: 220 }} />
            <Button variant="contained" onClick={loadRows}>Load Students</Button>
            <Button variant="outlined" startIcon={processing === "attendance" ? <CircularProgress size={18} /> : <RuleIcon />} disabled={!!processing} onClick={() => runCheck("attendance")}>Check Attendance</Button>
            <Button variant="outlined" startIcon={processing === "fees" ? <CircularProgress size={18} /> : <RuleIcon />} disabled={!!processing} onClick={() => runCheck("fees")}>Check Fees</Button>
            <Button variant="outlined" startIcon={processing === "disciplinary" ? <CircularProgress size={18} /> : <RuleIcon />} disabled={!!processing} onClick={() => runCheck("disciplinary")}>Check Disciplinary</Button>
            <Button variant="outlined" startIcon={processing === "backlogs" ? <CircularProgress size={18} /> : <RuleIcon />} disabled={!!processing} onClick={() => runCheck("backlogs")}>Check Backlogs</Button>
          </Stack>
        </Paper>
        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 1700 }} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
