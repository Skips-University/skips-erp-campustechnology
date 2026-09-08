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
import { ArrowBack, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));

export default function NepLmsAssessmentMarksPage() {
  const [courses, setCourses] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [regulation, setRegulation] = useState("");
  const [semester, setSemester] = useState("");
  const [courseKey, setCourseKey] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [assessmentId, setAssessmentId] = useState("");
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const years = useMemo(() => uniqueSorted(courses.map((row) => row.academicyear)), [courses]);
  const regulations = useMemo(() => uniqueSorted(courses
    .filter((row) => !academicYear || row.academicyear === academicYear)
    .map((row) => row.regulation)), [courses, academicYear]);
  const semesters = useMemo(() => uniqueSorted(courses.filter((row) => (
    (!academicYear || row.academicyear === academicYear)
    && (!regulation || row.regulation === regulation)
  )).map((row) => row.semester)), [courses, academicYear, regulation]);
  const filteredCourses = useMemo(() => courses.filter((row) => (
    (!academicYear || row.academicyear === academicYear)
    && (!regulation || row.regulation === regulation)
    && (!semester || row.semester === semester)
  )), [courses, academicYear, regulation, semester]);
  const selectedCourse = useMemo(() => filteredCourses.find((row) => `${row._id}-${row.coursecode}` === courseKey) || null, [filteredCourses, courseKey]);
  const selectedAssessment = useMemo(() => assessments.find((row) => row._id === assessmentId) || null, [assessments, assessmentId]);

  useEffect(() => {
    if (selectedCourse) loadAssessments(selectedCourse);
    else {
      setAssessments([]);
      setAssessmentId("");
      setStudents([]);
      setMarksMap({});
    }
  }, [courseKey]);

  useEffect(() => {
    if (selectedCourse && selectedAssessment) loadStudents();
    else {
      setStudents([]);
      setMarksMap({});
    }
  }, [assessmentId]);

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
      const firstRegulation = uniqueSorted(assigned.filter((row) => !firstYear || row.academicyear === firstYear).map((row) => row.regulation))[0] || "";
      const firstSemester = uniqueSorted(assigned.filter((row) => (
        (!firstYear || row.academicyear === firstYear)
        && (!firstRegulation || row.regulation === firstRegulation)
      )).map((row) => row.semester))[0] || "";
      const firstCourse = assigned.find((row) => (
        (!firstYear || row.academicyear === firstYear)
        && (!firstRegulation || row.regulation === firstRegulation)
        && (!firstSemester || row.semester === firstSemester)
      ));
      setAcademicYear(firstYear);
      setRegulation(firstRegulation);
      setSemester(firstSemester);
      setCourseKey(firstCourse ? `${firstCourse._id}-${firstCourse.coursecode}` : "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assigned courses");
    } finally {
      setLoading(false);
    }
  };

  const changeYear = (value) => {
    const nextRegulation = uniqueSorted(courses.filter((row) => !value || row.academicyear === value).map((row) => row.regulation))[0] || "";
    const nextSemester = uniqueSorted(courses.filter((row) => (
      (!value || row.academicyear === value)
      && (!nextRegulation || row.regulation === nextRegulation)
    )).map((row) => row.semester))[0] || "";
    const nextCourse = courses.find((row) => (
      (!value || row.academicyear === value)
      && (!nextRegulation || row.regulation === nextRegulation)
      && (!nextSemester || row.semester === nextSemester)
    ));
    setAcademicYear(value);
    setRegulation(nextRegulation);
    setSemester(nextSemester);
    setCourseKey(nextCourse ? `${nextCourse._id}-${nextCourse.coursecode}` : "");
  };

  const changeRegulation = (value) => {
    const nextSemester = uniqueSorted(courses.filter((row) => (
      (!academicYear || row.academicyear === academicYear)
      && (!value || row.regulation === value)
    )).map((row) => row.semester))[0] || "";
    const nextCourse = courses.find((row) => (
      (!academicYear || row.academicyear === academicYear)
      && (!value || row.regulation === value)
      && (!nextSemester || row.semester === nextSemester)
    ));
    setRegulation(value);
    setSemester(nextSemester);
    setCourseKey(nextCourse ? `${nextCourse._id}-${nextCourse.coursecode}` : "");
  };

  const changeSemester = (value) => {
    const nextCourse = courses.find((row) => (
      (!academicYear || row.academicyear === academicYear)
      && (!regulation || row.regulation === regulation)
      && (!value || row.semester === value)
    ));
    setSemester(value);
    setCourseKey(nextCourse ? `${nextCourse._id}-${nextCourse.coursecode}` : "");
  };

  const loadAssessments = async (course) => {
    try {
      setError("");
      const res = await ep1.get("/api/v2/neplms/assessment-marks/assessments", {
        params: {
          colid: global1.colid,
          academicyear: course.academicyear,
          regulation: course.regulation,
          coursecode: course.coursecode,
          semester: course.semester,
          status: "Active"
        }
      });
      const rows = res.data?.data || [];
      setAssessments(rows);
      setAssessmentId(rows[0]?._id || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assessment scheme");
    }
  };

  const loadStudents = async () => {
    if (!selectedCourse || !selectedAssessment) return;
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/assessment-marks/students", {
        params: {
          colid: global1.colid,
          academicyear: selectedCourse.academicyear,
          program: selectedCourse.program,
          programcode: selectedCourse.programcode,
          semester: selectedCourse.semester,
          major: selectedCourse.subject,
          coursecode: selectedCourse.coursecode,
          assessmentcomponent: selectedAssessment.assessmentcomponent,
          assessmentgroup: selectedAssessment.assessmentgroup
        }
      });
      const rows = res.data?.data || [];
      setStudents(rows);
      setMarksMap(Object.fromEntries(rows.map((row) => [row._id, row.marksobtained ?? ""])));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoading(false);
    }
  };

  const totalMarks = Number(selectedAssessment?.marks) || 0;
  const weightage = Number(selectedAssessment?.weightage) || 0;
  const effectiveMarks = (value) => {
    const marks = Number(value);
    if (Number.isNaN(marks)) return "";
    return marks * weightage;
  };

  const updateMarks = (id, value) => {
    const numberValue = Number(value);
    if (value !== "" && (Number.isNaN(numberValue) || numberValue < 0)) return;
    if (value !== "" && numberValue > totalMarks) {
      setError(`Marks cannot be more than ${totalMarks}`);
      return;
    }
    setError("");
    setMarksMap((prev) => ({ ...prev, [id]: value }));
  };

  const saveMarks = async () => {
    if (!selectedCourse || !selectedAssessment) {
      setError("Select course and assessment scheme");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const marks = students.map((student) => ({
        ...student,
        marksobtained: marksMap[student._id]
      })).filter((row) => row.marksobtained !== "" && row.marksobtained !== undefined && row.marksobtained !== null);

      const invalid = marks.find((row) => Number(row.marksobtained) > totalMarks);
      if (invalid) {
        setError(`Marks for ${invalid.student || invalid.name} cannot be more than ${totalMarks}`);
        return;
      }

      const res = await ep1.post("/api/v2/neplms/assessment-marks/savebulk", {
        colid: global1.colid,
        user: global1.user,
        course: selectedCourse,
        assessment: selectedAssessment,
        marks
      });
      const errors = res.data?.errors || [];
      setMessage(`Marks saved: ${res.data?.saved || 0}${errors.length ? `, Errors: ${errors.length}` : ""}`);
      if (errors.length) setError(errors.slice(0, 5).map((item) => `${item.regno || item.rowNumber}: ${item.message}`).join(" | "));
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save marks");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "student", headerName: "Student", width: 190 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "Major", headerName: "Major", width: 180 },
    { field: "semester", headerName: "Semester", width: 110 },
    {
      field: "marksentry",
      headerName: `Marks Obtained / ${totalMarks || 0}`,
      width: 190,
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
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Assessment Marks Entry</Typography>
          <Typography variant="body2" color="text.secondary">Enter marks for assigned courses and active course assessment schemes.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadCourses}>Reload</Button>
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
              <InputLabel>Regulation</InputLabel>
              <Select label="Regulation" value={regulation} onChange={(event) => changeRegulation(event.target.value)}>
                {regulations.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
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
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Assessment Scheme</InputLabel>
              <Select label="Assessment Scheme" value={assessmentId} onChange={(event) => setAssessmentId(event.target.value)}>
                {assessments.map((row) => (
                  <MenuItem key={row._id} value={row._id}>
                    {row.assessmentcomponent} | {row.assessmentgroup} | {row.grouptype} | {row.scoretype} | Marks: {row.marks} | Weightage: {row.weightage}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {selectedCourse && selectedAssessment && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Chip label={`Regulation: ${selectedCourse.regulation}`} />
            <Chip label={`Program: ${selectedCourse.programcode}`} />
            <Chip label={`Type: ${selectedCourse.type}`} />
            <Chip label={`Subject: ${selectedCourse.subject}`} />
            <Chip label={`Assessment Group: ${selectedAssessment.assessmentgroup || "NA"}`} />
            <Chip label={`Group Type: ${selectedAssessment.grouptype || "NA"}`} />
            <Chip label={`Score Type: ${selectedAssessment.scoretype || "NA"}`} />
            <Chip color="primary" label={`Total Marks: ${totalMarks}`} />
            <Chip color="success" label={`Weightage: ${weightage}`} />
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ p: 1 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`Students: ${students.length}`} />
            <Chip label={`Entered: ${Object.values(marksMap).filter((value) => value !== "").length}`} />
          </Stack>
          <Button variant="contained" startIcon={<Save />} onClick={saveMarks} disabled={saving || !selectedAssessment || !students.length}>
            Save Bulk Marks
          </Button>
        </Stack>
        <DataGrid
          rows={students}
          getRowId={(row) => row._id}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "assessment_marks_entry" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
          sx={{ minWidth: 1320 }}
        />
      </Paper>
    </Box>
  );
}
