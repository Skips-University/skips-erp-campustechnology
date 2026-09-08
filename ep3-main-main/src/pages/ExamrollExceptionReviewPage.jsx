import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const baseFields = ["academicyear", "exam", "examcode", "regulation", "program", "programcode"];
const labels = {
  academicyear: "Academic Year",
  exam: "Exam",
  examcode: "Exam Code",
  regulation: "Regulation",
  program: "Program",
  programcode: "Program Code"
};

const config = {
  detained: {
    title: "Detained Students",
    subtitle: "Review students detained by attendance rule and approve eligible exceptions with proper reason.",
    statusField: "attendance",
    statusValue: "DETAINED",
    routeTitle: "Detained students",
    success: "Attendance detention changed to Yes."
  },
  disciplinary: {
    title: "Disciplinary",
    subtitle: "Review students on disciplinary hold and approve eligible exceptions with proper reason.",
    statusField: "disciplinary",
    statusValue: "DISCIPLINARY_HOLD",
    routeTitle: "Disciplinary",
    success: "Disciplinary hold changed to Yes."
  },
  fees: {
    title: "Fees Defaulters",
    subtitle: "Review students marked as fees defaulters and approve eligible exceptions with proper reason.",
    statusField: "fees",
    statusValue: "FEES_DEFAULTER",
    routeTitle: "Fees defaulters",
    success: "Fees status changed to Yes."
  }
};

function ExamrollExceptionReviewPage({ mode }) {
  const page = config[mode];
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const params = (sourceFilters = filters) => {
    const next = { colid: global1.colid, [page.statusField]: page.statusValue };
    baseFields.forEach((field) => {
      if (sourceFilters[field]) next[field] = sourceFilters[field];
    });
    return next;
  };

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/conductexam/examroll-rules/options", { params: { colid: global1.colid } });
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options");
    }
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/examroll-rules/rows", { params: params(nextFilters) });
      setRows(res.data?.data || []);
      setSelectedRow(null);
      setRemarks("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    const nextFilters = {};
    setFilters(nextFilters);
    loadRows(nextFilters);
  };

  const approveRow = async () => {
    if (!selectedRow?._id) {
      setError("Select one student first.");
      return;
    }
    if (!remarks.trim()) {
      setError("Reason is required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/conductexam/examroll-rules/override", {
        colid: global1.colid,
        id: selectedRow._id,
        statusField: page.statusField,
        remarks,
        user: global1.user
      });
      setMessage(page.success);
      await Promise.all([loadRows(), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update status");
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(() => [
    { field: "student", headerName: "Student", width: 180 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "academicyear", headerName: "Academic Year", width: 130 },
    { field: "exam", headerName: "Exam", width: 190 },
    { field: "examcode", headerName: "Exam Code", width: 130 },
    { field: "regulation", headerName: "Regulation", width: 140 },
    { field: "program", headerName: "Program", width: 190 },
    { field: "programcode", headerName: "Program Code", width: 130 },
    { field: "semester", headerName: "Semester", width: 100 },
    { field: "course", headerName: "Course", width: 200 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: page.statusField, headerName: page.statusField === "attendance" ? "Attendance" : page.statusField === "fees" ? "Fees" : "Disciplinary", width: 160 },
    { field: "admitcardeligible", headerName: "Admit Eligible", width: 130 },
    { field: "remarks", headerName: "Remarks", width: 260 }
  ], [page.statusField]);

  return (
    <MenuPageShell title={page.routeTitle}>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={900}>{page.title}</Typography>
          <Typography color="text.secondary">{page.subtitle}</Typography>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            {baseFields.map((field) => (
              <Grid item xs={12} sm={6} md={2} key={field}>
                <FormControl fullWidth>
                  <InputLabel>{labels[field]}</InputLabel>
                  <Select label={labels[field]} value={filters[field] || ""} onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}>
                    <MenuItem value="">All</MenuItem>
                    {(options[field] || []).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={loadRows} disabled={loading} sx={{ height: 56 }}>{loading ? "Loading..." : "Apply"}</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={clearFilters} disabled={loading} sx={{ height: 56 }}>Clear</Button></Grid>
          </Grid>
        </Paper>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack spacing={2}>
            <Typography fontWeight={800}>{selectedRow ? `${selectedRow.student || "Selected student"} - ${selectedRow.regno || ""}` : "Select a student from the grid"}</Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Reason / Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <Button
              variant="contained"
              disabled={!selectedRow || saving}
              onClick={approveRow}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
            >
              {saving ? "Updating..." : "Change to Yes"}
            </Button>
          </Stack>
        </Paper>
        <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e5e7eb", borderRadius: 2, overflowX: "auto" }}>
          <DataGrid
            rows={rows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: page.title.replace(/\s+/g, "_").toLowerCase() } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            onRowClick={(params) => {
              setSelectedRow(params.row);
              setRemarks(params.row.remarks || "");
            }}
            sx={{ minWidth: 1600 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

export function DetainedStudentsPage() {
  return <ExamrollExceptionReviewPage mode="detained" />;
}

export function ExamrollDisciplinaryHoldPage() {
  return <ExamrollExceptionReviewPage mode="disciplinary" />;
}

export function FeesDefaultersPage() {
  return <ExamrollExceptionReviewPage mode="fees" />;
}
