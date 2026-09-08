import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
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
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, Refresh, Save } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankFilters = { academicyear: "", program: "", programcode: "", major: "", semester: "" };
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export default function NepLmsStudentAssessmentPage() {
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState(blankFilters);
  const [courseId, setCourseId] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [answerImages, setAnswerImages] = useState({});
  const [uploadingAnswerImage, setUploadingAnswerImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedCourse = useMemo(() => courses.find((row) => row._id === courseId) || null, [courses, courseId]);
  const selectedAssessment = useMemo(() => assessments.find((row) => row._id === selectedAssessmentId) || null, [assessments, selectedAssessmentId]);

  const filteredCourses = useMemo(() => courses.filter((row) => (
    (!filters.academicyear || row.academicyear === filters.academicyear)
    && (!filters.program || row.program === filters.program)
    && (!filters.programcode || row.programcode === filters.programcode)
    && (!filters.major || row.subject === filters.major)
    && (!filters.semester || row.semester === filters.semester)
  )), [courses, filters]);

  const options = useMemo(() => ({
    academicyears: uniqueSorted(courses.map((row) => row.academicyear)),
    programs: uniqueSorted(courses.map((row) => row.program)),
    programcodes: uniqueSorted(courses.map((row) => row.programcode)),
    majors: uniqueSorted(courses.map((row) => row.subject)),
    semesters: uniqueSorted(courses.map((row) => row.semester))
  }), [courses]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) loadAssessments(selectedCourse);
    else {
      setAssessments([]);
      setAttempts([]);
      setSelectedAssessmentId("");
    }
  }, [courseId]);

  const baseParams = (extra = {}) => ({ colid: global1.colid, regno: global1.regno, ...extra });

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/student-workspace/courses", { params: baseParams(filters) });
      const nextCourses = res.data?.courses || [];
      setStudent(res.data?.student || null);
      setCourses(nextCourses);
      if (!courseId && nextCourses.length) setCourseId(nextCourses[0]._id);
      if (courseId && !nextCourses.some((row) => row._id === courseId)) setCourseId("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student courses");
    } finally {
      setLoading(false);
    }
  };

  const loadAssessments = async (course = selectedCourse) => {
    if (!course) return;
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/neplms/student-workspace/active-assessments", {
        params: baseParams({
          academicyear: course.academicyear,
          program: course.program,
          programcode: course.programcode,
          major: course.subject,
          semester: course.semester,
          coursecode: course.coursecode
        })
      });
      const active = res.data?.data || [];
      const nextAttempts = res.data?.attempts || [];
      setAssessments(active);
      setAttempts(nextAttempts);
      setSelectedAttempt((prev) => nextAttempts.find((item) => item._id === prev?._id) || nextAttempts[0] || null);
      setSelectedAssessmentId(active[0]?._id || "");
      setAnswers({});
      setAnswerImages({});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCourseId("");
  };

  const submitAssessment = async () => {
    if (!selectedAssessment) {
      setError("Please select an active assessment");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      const payloadAnswers = [];
      (selectedAssessment.sections || []).forEach((section) => {
        (section.questions || []).forEach((question) => {
          payloadAnswers.push({
            questionid: question._id,
            answer: answers[question._id] || "",
            answerimageurl: answerImages[question._id]?.url || "",
            answerimagefilename: answerImages[question._id]?.filename || ""
          });
        });
      });
      await ep1.post("/api/v2/neplms/student-workspace/assessment-submit", {
        colid: global1.colid,
        regno: global1.regno,
        user: global1.user,
        assessmentid: selectedAssessment._id,
        answers: payloadAnswers
      });
      setMessage("Assessment submitted successfully.");
      setSelectedAssessmentId("");
      setSelectedAttempt(null);
      setAnswers({});
      setAnswerImages({});
      await loadAssessments(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const uploadAnswerImage = async (questionid, file) => {
    if (!file) return;
    try {
      if (!String(file.type || "").startsWith("image/")) throw new Error("Please upload an image file");
      setUploadingAnswerImage(questionid);
      setError("");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("colid", global1.colid);
      formData.append("context", "answer");
      const res = await ep1.post("/api/v2/neplms/assessments/image-upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setAnswerImages((prev) => ({
        ...prev,
        [questionid]: {
          url: res.data?.data?.url || "",
          filename: res.data?.data?.originalname || res.data?.data?.filename || file.name
        }
      }));
      setMessage("Answer image uploaded");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to upload answer image");
    } finally {
      setUploadingAnswerImage("");
    }
  };

  const filterSelect = (field, label, values) => (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={filters[field]} onChange={(event) => updateFilter(field, event.target.value)}>
        <MenuItem value="">All</MenuItem>
        {values.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
      </Select>
    </FormControl>
  );

  const attemptColumns = [
    { field: "assessmenttitle", headerName: "Assessment", minWidth: 240, flex: 1 },
    { field: "course", headerName: "Course", minWidth: 180 },
    { field: "coursecode", headerName: "Course Code", minWidth: 130 },
    { field: "submitteddate", headerName: "Submitted", minWidth: 170, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
    { field: "totalmarks", headerName: "Total Marks", minWidth: 120 },
    { field: "obtainedmarks", headerName: "Marks Obtained", minWidth: 140 },
    { field: "status", headerName: "Status", minWidth: 120 }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Assessment</Typography>
          <Typography variant="body2" color="text.secondary">{student?.name || global1.name || "Student"} | {global1.regno}</Typography>
        </Box>
        <Button component={RouterLink} to="/dashmclassenr1stud" variant="outlined" startIcon={<ArrowBack />}>Back to dashboard</Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>{filterSelect("academicyear", "Academic Year", options.academicyears)}</Grid>
          <Grid item xs={12} md={2}>{filterSelect("program", "Program", options.programs)}</Grid>
          <Grid item xs={12} md={2}>{filterSelect("programcode", "Program Code", options.programcodes)}</Grid>
          <Grid item xs={12} md={2}>{filterSelect("major", "Major", options.majors)}</Grid>
          <Grid item xs={12} md={2}>{filterSelect("semester", "Semester", options.semesters)}</Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="outlined" startIcon={<Refresh />} onClick={loadCourses}>Load</Button></Grid>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Course</InputLabel>
              <Select label="Course" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                {filteredCourses.map((course) => <MenuItem key={course._id} value={course._id}>{course.course} ({course.coursecode}) | Sem {course.semester} | {course.subject}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h6">Active Assessments</Typography>
          <FormControl size="small" sx={{ minWidth: 320 }}>
            <InputLabel>Assessment</InputLabel>
            <Select label="Assessment" value={selectedAssessmentId} onChange={(event) => { setSelectedAssessmentId(event.target.value); setAnswers({}); setAnswerImages({}); }}>
              {assessments.map((assessment) => (
                <MenuItem key={assessment._id} value={assessment._id}>
                  {assessment.title} | Ends {assessment.enddatetime ? new Date(assessment.enddatetime).toLocaleString() : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {!assessments.length && <Alert severity="info">No active descriptive assessment is available for this course right now.</Alert>}

        {selectedAssessment && (
          <Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
              <Chip label={selectedAssessment.title} />
              <Chip label={`Module: ${selectedAssessment.module || "-"}`} />
              <Chip label={`Topic: ${selectedAssessment.topic || "-"}`} />
              <Chip label={`Ends: ${selectedAssessment.enddatetime ? new Date(selectedAssessment.enddatetime).toLocaleString() : "-"}`} />
            </Stack>
            {selectedAssessment.instructions && <Alert severity="info" sx={{ mb: 2 }}>{selectedAssessment.instructions}</Alert>}
            {(selectedAssessment.sections || []).map((section) => (
              <Paper key={section._id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>{section.title}</Typography>
                {(section.questions || []).map((question, index) => (
                  <Box key={question._id} sx={{ mb: 2 }}>
                    <Typography fontWeight={700}>{index + 1}. {question.question} <Chip size="small" label={`${question.marks} marks`} /></Typography>
                    {question.imageurl && (
                      <Box sx={{ mt: 1 }}>
                        <Box component="img" src={question.imageurl} alt="Question" sx={{ maxWidth: 320, maxHeight: 220, objectFit: "contain", border: "1px solid #cbd5e1", borderRadius: 1 }} />
                      </Box>
                    )}
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, rowGap: 1 }}>
                      {question.fileurl && <Button size="small" href={question.fileurl} target="_blank" rel="noreferrer">Open question file</Button>}
                      {question.videourl && <Button size="small" href={question.videourl} target="_blank" rel="noreferrer">Open question video</Button>}
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      sx={{ mt: 1 }}
                      label="Answer"
                      value={answers[question._id] || ""}
                      onChange={(event) => setAnswers((prev) => ({ ...prev, [question._id]: event.target.value }))}
                    />
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "flex-start", md: "center" }} sx={{ mt: 1 }}>
                      <Button variant="outlined" component="label" disabled={uploadingAnswerImage === question._id}>
                        {uploadingAnswerImage === question._id ? "Uploading..." : "Upload Answer Image"}
                        <input hidden type="file" accept="image/*" onChange={(e) => uploadAnswerImage(question._id, e.target.files?.[0])} />
                      </Button>
                      {answerImages[question._id]?.url && (
                        <>
                          <Box component="img" src={answerImages[question._id].url} alt="Answer upload" sx={{ width: 96, height: 72, objectFit: "contain", border: "1px solid #cbd5e1", borderRadius: 1 }} />
                          <Typography component="a" href={answerImages[question._id].url} target="_blank" rel="noreferrer" variant="body2" sx={{ wordBreak: "break-all" }}>
                            {answerImages[question._id].filename || "Uploaded image"}
                          </Typography>
                          <Button size="small" color="error" onClick={() => setAnswerImages((prev) => ({ ...prev, [question._id]: null }))}>Remove</Button>
                        </>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Paper>
            ))}
            <Button variant="contained" startIcon={<Save />} disabled={submitting} onClick={submitAssessment}>{submitting ? "Submitting..." : "Submit Assessment"}</Button>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>My Submitted Assessments</Typography>
        <Box sx={{ height: 420 }}>
          <DataGrid
            rows={attempts.map((row) => ({ ...row, id: row._id }))}
            columns={attemptColumns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "my_assessments" } } }}
            onRowClick={(params) => setSelectedAttempt(params.row)}
          />
        </Box>
        {selectedAttempt && (
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6">{selectedAttempt.assessmenttitle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAttempt.course} ({selectedAttempt.coursecode}) | Semester {selectedAttempt.semester}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip color="primary" label={`Total: ${selectedAttempt.totalmarks || 0}`} />
                <Chip color="success" label={`Obtained: ${selectedAttempt.obtainedmarks || 0}`} />
                <Chip label={selectedAttempt.status || "Submitted"} />
              </Stack>
            </Stack>
            {(selectedAttempt.answers || []).map((answer, index) => (
              <Paper key={answer.questionid || index} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                  <Typography fontWeight={700}>{index + 1}. {answer.question}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" label={`Max: ${answer.maxmarks || 0}`} />
                    <Chip size="small" color="success" label={`Marks: ${answer.marks || 0}`} />
                  </Stack>
                </Stack>
                {answer.questionimageurl && (
                  <Box sx={{ mt: 1 }}>
                    <Box component="img" src={answer.questionimageurl} alt="Question" sx={{ maxWidth: 320, maxHeight: 220, objectFit: "contain", border: "1px solid #cbd5e1", borderRadius: 1 }} />
                  </Box>
                )}
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, rowGap: 1 }}>
                  {answer.questionfileurl && <Button size="small" href={answer.questionfileurl} target="_blank" rel="noreferrer">Open question file</Button>}
                  {answer.questionvideourl && <Button size="small" href={answer.questionvideourl} target="_blank" rel="noreferrer">Open question video</Button>}
                </Stack>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Your Answer</Typography>
                <Typography sx={{ whiteSpace: "pre-wrap", color: "text.secondary" }}>{answer.answer || "-"}</Typography>
                {answer.answerimageurl && (
                  <Box sx={{ mt: 1 }}>
                    <Typography component="a" href={answer.answerimageurl} target="_blank" rel="noreferrer" variant="body2" sx={{ display: "block", wordBreak: "break-all", mb: 1 }}>
                      {answer.answerimagefilename || "Uploaded answer image"}
                    </Typography>
                    <Box component="img" src={answer.answerimageurl} alt="Answer" sx={{ maxWidth: 320, maxHeight: 220, objectFit: "contain", border: "1px solid #cbd5e1", borderRadius: 1 }} />
                  </Box>
                )}
                {(answer.facultycomments || answer.aiFeedback) && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    {answer.facultycomments || answer.aiFeedback}
                  </Alert>
                )}
              </Paper>
            ))}
          </Paper>
        )}
      </Paper>
    </Container>
  );
}
