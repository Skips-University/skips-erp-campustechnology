import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Save } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const paperLabel = (row) => `${row.coursecode || ""} - ${row.course || ""} | ${row.examcode || ""} | ${row.programcode || ""} | ${row.startdate || ""} to ${row.enddate || ""}`;
const componentLabel = (row) => `${row.assessmentcomponent || ""} | ${row.assessmentgroup || ""} | Marks: ${row.marks || 0} | Weightage: ${row.weightage || 0}`;

export default function ConductExamExaminerMarksEntryPage() {
  const [startdate, setStartdate] = useState("");
  const [enddate, setEnddate] = useState("");
  const [papers, setPapers] = useState([]);
  const [paperKey, setPaperKey] = useState("");
  const [components, setComponents] = useState([]);
  const [componentId, setComponentId] = useState("");
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const examinerEmail = global1.user || global1.email || "";
  const selectedPaper = useMemo(() => papers.find((row) => paperLabel(row) === paperKey) || null, [papers, paperKey]);
  const selectedComponent = useMemo(() => components.find((row) => row._id === componentId) || null, [components, componentId]);
  const totalMarks = Number(selectedComponent?.marks) || 0;
  const weightage = Number(selectedComponent?.weightage) || 0;

  useEffect(() => {
    if (selectedPaper) loadComponents(selectedPaper);
    else {
      setComponents([]);
      setComponentId("");
      setStudents([]);
      setMarksMap({});
    }
  }, [paperKey]);

  useEffect(() => {
    if (selectedPaper && selectedComponent) loadStudents();
    else {
      setStudents([]);
      setMarksMap({});
    }
  }, [componentId]);

  const loadPapers = async () => {
    if (!startdate || !enddate) {
      setError("Start date and end date are required.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.get("/api/v2/conductexam/examiner-marks-papers", {
        params: { colid: global1.colid, examineremail: examinerEmail, startdate, enddate }
      });
      const rows = res.data?.data || [];
      setPapers(rows);
      setPaperKey(rows[0] ? paperLabel(rows[0]) : "");
      if (!rows.length) setMessage("No allocated papers found for the selected date range.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load allocated papers.");
    } finally {
      setLoading(false);
    }
  };

  const loadComponents = async (paper) => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/examiner-marks-components", {
        params: {
          colid: global1.colid,
          academicyear: paper.academicyear,
          regulation: paper.regulation,
          program: paper.program,
          programcode: paper.programcode,
          course: paper.course,
          coursecode: paper.coursecode
        }
      });
      const rows = res.data?.data || [];
      setComponents(rows);
      setComponentId(rows[0]?._id || "");
      if (!rows.length) setMessage("No external assessment component found for this paper.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load external assessment components.");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!selectedPaper || !selectedComponent) return;
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/examiner-marks-students", {
        params: {
          colid: global1.colid,
          examineremail: examinerEmail,
          academicyear: selectedPaper.academicyear,
          regulation: selectedPaper.regulation,
          examcode: selectedPaper.examcode,
          programcode: selectedPaper.programcode,
          coursecode: selectedPaper.coursecode,
          semester: selectedPaper.semester,
          startdate: selectedPaper.startdate,
          enddate: selectedPaper.enddate,
          assessmentcomponent: selectedComponent.assessmentcomponent,
          assessmentgroup: selectedComponent.assessmentgroup
        }
      });
      const rows = res.data?.data || [];
      setStudents(rows);
      setMarksMap(Object.fromEntries(rows.map((row) => [row._id, row.marksobtained ?? ""])));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load allotted students.");
    } finally {
      setLoading(false);
    }
  };

  const updateMarks = (id, value) => {
    const numberValue = Number(value);
    if (value !== "" && (Number.isNaN(numberValue) || numberValue < 0)) return;
    if (value !== "" && numberValue > totalMarks) {
      setError(`Marks cannot be more than ${totalMarks}.`);
      return;
    }
    setError("");
    setMarksMap((prev) => ({ ...prev, [id]: value }));
  };

  const effectiveMarks = (value) => {
    const marks = Number(value);
    if (Number.isNaN(marks)) return "";
    return marks * weightage;
  };

  const saveMarks = async () => {
    if (!selectedPaper || !selectedComponent) {
      setError("Select paper and external assessment component.");
      return;
    }
    const marks = students.map((student) => ({
      ...student,
      marksobtained: marksMap[student._id]
    })).filter((row) => row.marksobtained !== "" && row.marksobtained !== undefined && row.marksobtained !== null);
    const invalid = marks.find((row) => Number(row.marksobtained) > totalMarks);
    if (invalid) {
      setError(`Marks for ${invalid.student} cannot be more than ${totalMarks}.`);
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/conductexam/examiner-marks-save", {
        colid: global1.colid,
        user: examinerEmail,
        paper: selectedPaper,
        assessment: selectedComponent,
        marks
      });
      const errors = res.data?.errors || [];
      setMessage(`Marks saved: ${res.data?.saved || 0}${errors.length ? `, Errors: ${errors.length}` : ""}`);
      if (errors.length) setError(errors.slice(0, 5).map((item) => `${item.regno || item.rowNumber}: ${item.message}`).join(" | "));
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save examiner marks.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "student", headerName: "Student", minWidth: 190, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "seatno", headerName: "Seat No", width: 110 },
    {
      field: "marksentry",
      headerName: `Marks / ${totalMarks || 0}`,
      width: 180,
      renderCell: (params) => (
        <TextField
          size="small"
          type="number"
          value={marksMap[params.row._id] ?? ""}
          onChange={(event) => updateMarks(params.row._id, event.target.value)}
          inputProps={{ min: 0, max: totalMarks }}
        />
      )
    },
    {
      field: "effectivemarkscalc",
      headerName: "Effective Marks",
      width: 150,
      valueGetter: (params) => effectiveMarks(marksMap[params.row._id])
    }
  ];

  return (
    <MenuPageShell title="Examiner Marks Entry">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Examiner Marks Entry</Typography>
              <Typography color="text.secondary">Load papers allotted to you and enter external assessment marks.</Typography>
            </Box>
            <Button variant="contained" onClick={loadPapers} disabled={loading}>Load Papers</Button>
          </Stack>
          {(loading || saving) && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth required type="date" label="Start Date" value={startdate} onChange={(e) => setStartdate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth required type="date" label="End Date" value={enddate} onChange={(e) => setEnddate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Allocated Paper</InputLabel>
                <Select label="Allocated Paper" value={paperKey} onChange={(e) => setPaperKey(e.target.value)}>
                  {papers.map((row) => <MenuItem key={paperLabel(row)} value={paperLabel(row)}>{paperLabel(row)} ({row.students} students)</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>External Assessment Component</InputLabel>
                <Select label="External Assessment Component" value={componentId} onChange={(e) => setComponentId(e.target.value)}>
                  {components.map((row) => <MenuItem key={row._id} value={row._id}>{componentLabel(row)}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {selectedPaper && selectedComponent && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
              <Chip label={`Regulation: ${selectedPaper.regulation}`} />
              <Chip label={`Program: ${selectedPaper.programcode}`} />
              <Chip label={`Course: ${selectedPaper.coursecode}`} />
              <Chip label={`Subject: ${selectedPaper.subject || "NA"}`} />
              <Chip label={`Component: ${selectedComponent.assessmentcomponent}`} />
              <Chip color="primary" label={`Max Marks: ${totalMarks}`} />
              <Chip color="success" label={`Weightage: ${weightage}`} />
            </Stack>
          )}
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`Students: ${students.length}`} />
              <Chip label={`Entered: ${Object.values(marksMap).filter((value) => value !== "").length}`} />
            </Stack>
            <Button variant="contained" startIcon={<Save />} onClick={saveMarks} disabled={saving || !selectedComponent || !students.length}>
              {saving ? "Saving..." : "Save Marks"}
            </Button>
          </Stack>
          <Box sx={{ height: 590 }}>
            <DataGrid
              rows={students}
              getRowId={(row) => row._id}
              columns={columns}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "examiner_marks_entry" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
