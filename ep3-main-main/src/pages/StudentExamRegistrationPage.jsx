import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { ArrowBack, Print, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MentoringLayout from "./MentoringLayout";

const yesNo = (value) => String(value || "").toLowerCase() === "yes" ? "Yes" : "No";

export default function StudentExamRegistrationPage() {
  const [filters, setFilters] = useState({ academicyear: "", examcode: "" });
  const [options, setOptions] = useState({ academicyears: [], exams: [] });
  const [rows, setRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const printRef = useRef(null);

  useEffect(() => {
    loadInstitution();
    loadRows();
  }, []);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(Array.isArray(res.data) ? res.data[0] : res.data);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadRows = async (overrideFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = {
        colid: global1.colid,
        regno: global1.regno,
        academicyear: overrideFilters.academicyear,
        examcode: overrideFilters.examcode
      };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });
      const res = await ep1.get("/api/v2/conductexam/student-exam-registration", { params });
      const loadedRows = (res.data?.data || []).map((row) => ({ ...row, applied: yesNo(row.applied) }));
      setRows(loadedRows);
      setOptions(res.data?.options || { academicyears: [], exams: [] });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exam registration.");
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = useMemo(() => {
    const year = filters.academicyear;
    const sourceRows = rows.length ? rows : [];
    if (!year) return options.exams || [];
    const fromRows = sourceRows
      .filter((row) => row.academicyear === year)
      .map((row) => ({ examcode: row.examcode, exam: row.exam }));
    const optionExams = (options.exams || []).filter((item) => item.academicyear === year);
    const map = new Map([...optionExams, ...fromRows].filter((item) => item.examcode).map((item) => [item.examcode, item]));
    return [...map.values()].sort((a, b) => String(a.exam || "").localeCompare(String(b.exam || "")));
  }, [options, rows, filters.academicyear]);

  const selectedExam = filteredExams.find((item) => item.examcode === filters.examcode) || {};
  const registeredCount = rows.filter((row) => row.applied === "Yes").length;

  const updateApplied = (id, checked) => {
    setRows((prev) => prev.map((row) => row._id === id ? { ...row, applied: checked ? "Yes" : "No" } : row));
  };

  const saveRegistration = async () => {
    if (!rows.length) {
      setError("No courses available for registration.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const payload = {
        colid: global1.colid,
        regno: global1.regno,
        user: global1.user,
        items: rows.map((row) => ({ id: row._id, applied: row.applied }))
      };
      await ep1.post("/api/v2/conductexam/student-exam-registration", payload);
      setMessage("Exam registration updated successfully.");
      await loadRows(filters);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save exam registration.");
    } finally {
      setSaving(false);
    }
  };

  const printPreview = () => {
    const content = printRef.current?.innerHTML || "";
    const win = window.open("", "_blank", "width=1000,height=800");
    if (!win) {
      setError("Popup blocked. Please allow popups for print preview.");
      return;
    }
    win.document.write(`<html><head><title>Exam Registration</title><style>
      body{font-family:Arial,sans-serif;color:#111827;margin:18px}
      .header{text-align:center;margin-bottom:12px}
      .logo{max-height:70px;object-fit:contain}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #d1d5db;padding:6px;text-align:left}
      th{background:#f3f4f6}
      .meta{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin:10px 0 14px}
      .meta div{border:1px solid #e5e7eb;padding:6px;border-radius:4px}
      .sign{display:flex;justify-content:space-between;margin-top:34px}
      @page{size:A4;margin:12mm}
    </style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const columns = [
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", minWidth: 220, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "subject", headerName: "Subject", minWidth: 180, flex: 1 },
    { field: "type", headerName: "Type", width: 110 },
    { field: "examdate", headerName: "Exam Date", width: 130 },
    { field: "examslot", headerName: "Slot", width: 120 },
    {
      field: "applied",
      headerName: "Apply",
      width: 150,
      renderCell: (params) => (
        <FormControlLabel
          control={<Switch checked={params.row.applied === "Yes"} onChange={(event) => updateApplied(params.row._id, event.target.checked)} />}
          label={params.row.applied === "Yes" ? "Yes" : "No"}
          onKeyDown={(event) => event.stopPropagation()}
        />
      )
    }
  ];

  return (
    <MentoringLayout title="Exam Registration" student>
      <Stack spacing={2}>
        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Exam Registration</Typography>
              <Typography color="text.secondary">Select the courses you want to apply for and submit your exam registration.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => window.location.assign("/dashmclassenr1stud")}>Back</Button>
              <Button variant="outlined" startIcon={<Print />} onClick={printPreview} disabled={!rows.length}>Print Preview</Button>
            </Stack>
          </Stack>
        </Paper>

        {loading && <LinearProgress />}
        {saving && <LinearProgress color="success" />}
        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Academic Year"
                value={filters.academicyear}
                onChange={(event) => {
                  const next = { academicyear: event.target.value, examcode: "" };
                  setFilters(next);
                  loadRows(next);
                }}
              >
                <MenuItem value="">All</MenuItem>
                {(options.academicyears || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Exam"
                value={filters.examcode}
                onChange={(event) => {
                  const next = { ...filters, examcode: event.target.value };
                  setFilters(next);
                  loadRows(next);
                }}
              >
                <MenuItem value="">All</MenuItem>
                {filteredExams.map((item) => <MenuItem key={item.examcode} value={item.examcode}>{item.exam} ({item.examcode})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Chip color="primary" label={`${registeredCount}/${rows.length} selected`} sx={{ width: "100%", height: 40 }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="contained" startIcon={<Save />} onClick={saveRegistration} disabled={saving || loading || !rows.length} sx={{ height: 56 }}>
                {saving ? "Saving..." : "Submit Registration"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Box sx={{ height: 520 }}>
            <DataGrid
              rows={rows}
              getRowId={(row) => row._id}
              columns={columns}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_exam_registration" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>

        <Box ref={printRef} sx={{ display: "none" }}>
          <div className="header">
            {institution?.logolink && <img className="logo" src={institution.logolink} alt="Logo" />}
            <h2>{institution?.institutionname || global1.insname || "Institution"}</h2>
            <div>{institution?.address || ""}</div>
            <h3>Exam Registration Form</h3>
          </div>
          <div className="meta">
            <div><b>Student</b><br />{global1.name}</div>
            <div><b>Reg No</b><br />{global1.regno}</div>
            <div><b>Academic Year</b><br />{filters.academicyear || rows[0]?.academicyear || ""}</div>
            <div><b>Exam</b><br />{selectedExam.exam || rows[0]?.exam || ""} {filters.examcode || rows[0]?.examcode ? `(${filters.examcode || rows[0]?.examcode})` : ""}</div>
          </div>
          <table>
            <thead>
              <tr><th>Semester</th><th>Course</th><th>Course Code</th><th>Subject</th><th>Type</th><th>Exam Date</th><th>Slot</th><th>Applied</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td>{row.semester}</td>
                  <td>{row.course}</td>
                  <td>{row.coursecode}</td>
                  <td>{row.subject}</td>
                  <td>{row.type}</td>
                  <td>{row.examdate}</td>
                  <td>{row.examslot}</td>
                  <td>{row.applied}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="sign"><span>Student signature</span><span>Verified by</span><span>Date</span></div>
        </Box>
      </Stack>
    </MentoringLayout>
  );
}
