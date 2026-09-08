import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { ArrowBack, Delete, Edit, PlayArrow, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export default function NepLmsAssessmentMarksViewPage() {
  const [courses, setCourses] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [courseKey, setCourseKey] = useState("");
  const [marks, setMarks] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editMarks, setEditMarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const years = useMemo(() => uniqueSorted(courses.map((row) => row.academicyear)), [courses]);
  const semesters = useMemo(() => uniqueSorted(
    courses.filter((row) => !academicYear || row.academicyear === academicYear).map((row) => row.semester)
  ), [courses, academicYear]);
  const filteredCourses = useMemo(() => courses.filter((row) => (
    (!academicYear || row.academicyear === academicYear)
    && (!semester || row.semester === semester)
  )), [courses, academicYear, semester]);
  const selectedCourse = useMemo(
    () => filteredCourses.find((row) => `${row._id}-${row.coursecode}` === courseKey) || null,
    [filteredCourses, courseKey]
  );

  useEffect(() => {
    if (selectedCourse) loadMarks(selectedCourse);
    else setMarks([]);
  }, [courseKey]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/assessment-marks/courses", {
        params: { colid: global1.colid, facultyemail: global1.user, status: "Active" }
      });
      const assigned = res.data?.data || [];
      setCourses(assigned);

      const firstYear = uniqueSorted(assigned.map((row) => row.academicyear))[0] || "";
      const firstSemester = uniqueSorted(assigned.filter((row) => !firstYear || row.academicyear === firstYear).map((row) => row.semester))[0] || "";
      const firstCourse = assigned.find((row) => (!firstYear || row.academicyear === firstYear) && (!firstSemester || row.semester === firstSemester));
      setAcademicYear(firstYear);
      setSemester(firstSemester);
      setCourseKey(firstCourse ? `${firstCourse._id}-${firstCourse.coursecode}` : "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assigned courses");
    } finally {
      setLoading(false);
    }
  };

  const loadMarks = async (course = selectedCourse) => {
    if (!course) return;
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/assessment-marks", {
        params: {
          colid: global1.colid,
          facultyemail: global1.user,
          academicyear: course.academicyear,
          semester: course.semester,
          coursecode: course.coursecode
        }
      });
      setMarks(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load marks");
    } finally {
      setLoading(false);
    }
  };

  const changeYear = (value) => {
    const nextSemester = uniqueSorted(courses.filter((row) => !value || row.academicyear === value).map((row) => row.semester))[0] || "";
    const nextCourse = courses.find((row) => (!value || row.academicyear === value) && (!nextSemester || row.semester === nextSemester));
    setAcademicYear(value);
    setSemester(nextSemester);
    setCourseKey(nextCourse ? `${nextCourse._id}-${nextCourse.coursecode}` : "");
  };

  const changeSemester = (value) => {
    const nextCourse = courses.find((row) => (!academicYear || row.academicyear === academicYear) && (!value || row.semester === value));
    setSemester(value);
    setCourseKey(nextCourse ? `${nextCourse._id}-${nextCourse.coursecode}` : "");
  };

  const openEdit = (row) => {
    setEditingRow(row);
    setEditMarks(row.marksobtained ?? "");
    setError("");
    setMessage("");
  };

  const closeEdit = () => {
    setEditingRow(null);
    setEditMarks("");
  };

  const saveEdit = async () => {
    if (!editingRow) return;
    const numericMarks = Number(editMarks);
    const totalMarks = Number(editingRow.totalmarks) || 0;
    if (Number.isNaN(numericMarks) || numericMarks < 0) {
      setError("Enter a valid marks value");
      return;
    }
    if (totalMarks && numericMarks > totalMarks) {
      setError(`Marks cannot be more than ${totalMarks}`);
      return;
    }

    try {
      setSaving(true);
      setError("");
      const res = await ep1.post("/api/v2/neplms/assessment-marks/update", {
        id: editingRow._id,
        colid: global1.colid,
        user: global1.user,
        marksobtained: numericMarks
      });
      const updated = res.data?.data;
      setMarks((prev) => prev.map((row) => (row._id === editingRow._id ? updated : row)));
      setMessage("Marks updated");
      closeEdit();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update marks");
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (row) => {
    const ok = window.confirm(`Delete marks for ${row.student || row.regno}?`);
    if (!ok) return;
    try {
      setLoading(true);
      setError("");
      await ep1.post("/api/v2/neplms/assessment-marks/delete", {
        id: row._id,
        colid: global1.colid
      });
      setMarks((prev) => prev.filter((item) => item._id !== row._id));
      setMessage("Marks entry deleted");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete marks");
    } finally {
      setLoading(false);
    }
  };

  const processMarks = async () => {
    if (!selectedCourse) {
      setError("Select a course first");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/component-marks/process", {
        colid: global1.colid,
        user: global1.user,
        facultyemail: global1.user,
        academicyear: selectedCourse.academicyear,
        semester: selectedCourse.semester,
        coursecode: selectedCourse.coursecode,
        course: selectedCourse.course,
        programcode: selectedCourse.programcode
      });
      setMessage(`Componentwise marks processed: ${res.data?.processed || 0}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process componentwise marks");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "student", headerName: "Student", width: 190 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "subject", headerName: "Subject", width: 170 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "assessmentcomponent", headerName: "Assessment Component", width: 210 },
    { field: "assessmentgroup", headerName: "Assessment Group", width: 170 },
    { field: "grouptype", headerName: "Group Type", width: 140 },
    { field: "scoretype", headerName: "Score Type", width: 140 },
    { field: "totalmarks", headerName: "Total Marks", width: 130, type: "number" },
    { field: "weightage", headerName: "Weightage", width: 120, type: "number" },
    { field: "marksobtained", headerName: "Marks Obtained", width: 150, type: "number" },
    { field: "effectivemarks", headerName: "Effective Marks", width: 150, type: "number" },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => openEdit(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    }
  ];

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Assessment Marks View</Typography>
          <Typography variant="body2" color="text.secondary">View, edit and delete marks entered for your assigned courses.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadCourses}>Reload</Button>
          <Button variant="contained" startIcon={<PlayArrow />} onClick={processMarks} disabled={saving || !selectedCourse || !marks.length}>
            Process Marks
          </Button>
        </Stack>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select label="Academic Year" value={academicYear} onChange={(event) => changeYear(event.target.value)}>
                {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select label="Semester" value={semester} onChange={(event) => changeSemester(event.target.value)}>
                {semesters.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Assigned Course</InputLabel>
              <Select label="Assigned Course" value={courseKey} onChange={(event) => setCourseKey(event.target.value)}>
                {filteredCourses.map((row) => (
                  <MenuItem key={`${row._id}-${row.coursecode}`} value={`${row._id}-${row.coursecode}`}>
                    {row.coursecode} - {row.course} ({row.subject})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {selectedCourse && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Chip label={`Regulation: ${selectedCourse.regulation || "NA"}`} />
            <Chip label={`Program: ${selectedCourse.programcode || "NA"}`} />
            <Chip label={`Type: ${selectedCourse.type || "NA"}`} />
            <Chip label={`Subject: ${selectedCourse.subject || "NA"}`} />
            <Chip color="primary" label={`Marks entries: ${marks.length}`} />
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={marks}
          getRowId={(row) => row._id}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "assessment_marks_view" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
          sx={{ minWidth: 2100 }}
        />
      </Paper>

      <Dialog open={Boolean(editingRow)} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Marks</DialogTitle>
        <DialogContent>
          {editingRow && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {editingRow.student} ({editingRow.regno}) - {editingRow.assessmentcomponent}
              </Typography>
              <TextField
                label={`Marks Obtained / ${editingRow.totalmarks || 0}`}
                type="number"
                value={editMarks}
                onChange={(event) => setEditMarks(event.target.value)}
                inputProps={{ min: 0, max: editingRow.totalmarks || undefined }}
                fullWidth
              />
              <TextField
                label="Effective Marks"
                value={Number.isNaN(Number(editMarks)) ? "" : Number(editMarks) * (Number(editingRow.weightage) || 0)}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} onClick={saveEdit} disabled={saving}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
