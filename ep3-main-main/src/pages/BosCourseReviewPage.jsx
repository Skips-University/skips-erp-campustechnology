import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Container, Grid, LinearProgress, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { AutoFixHigh, FactCheck, Save } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function BosCourseReviewPage() {
  const [cycles, setCycles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [cycleid, setCycleid] = useState("");
  const [assignmentid, setAssignmentid] = useState("");
  const [oldsyllabus, setOldsyllabus] = useState("");
  const [newsyllabus, setNewsyllabus] = useState("");
  const [assessmentscheme, setAssessmentscheme] = useState("");
  const [geminisuggestion, setGeminisuggestion] = useState("");
  const [geminireview, setGeminireview] = useState("");
  const [matchpercent, setMatchpercent] = useState(0);
  const [newpercent, setNewpercent] = useState(0);
  const [facultymessage, setFacultymessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedAssignment = useMemo(() => assignments.find((a) => a._id === assignmentid), [assignments, assignmentid]);

  const loadBase = async () => {
    const [cycleRes, assignRes, reviewRes] = await Promise.all([
      ep1.get("/api/v2/bos/cycles", { params: { colid: global1.colid, status: "Active" } }),
      ep1.get("/api/v2/bos/assignments", { params: { colid: global1.colid, facultyemail: global1.user } }),
      ep1.get("/api/v2/bos/course-reviews", { params: { colid: global1.colid, facultyemail: global1.user } })
    ]);
    setCycles(cycleRes.data.data || []);
    setAssignments(assignRes.data.data || []);
    setReviews(reviewRes.data.data || []);
  };
  useEffect(() => { loadBase(); }, []);

  const suggest = async () => {
    if (!assignmentid) {
      setError("Please select an assigned course");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await ep1.post("/api/v2/bos/course-review/suggest", { colid: global1.colid, assignmentid });
      const data = res.data.data || {};
      setOldsyllabus(res.data.oldsyllabus || "");
      setNewsyllabus(data.newsyllabus || "");
      setAssessmentscheme(data.assessmentscheme || "");
      setGeminisuggestion([data.summary, data.inclusions?.join?.("\n"), data.deletions?.join?.("\n")].filter(Boolean).join("\n\n"));
      setMessage("Gemini suggestion generated");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate Gemini suggestion");
    } finally {
      setLoading(false);
    }
  };

  const review = async () => {
    if (!oldsyllabus || !newsyllabus) {
      setError("Please generate or enter syllabus changes first");
      return;
    }
    try {
      setLoading(true);
      const res = await ep1.post("/api/v2/bos/course-review/review", { colid: global1.colid, oldsyllabus, newsyllabus });
      const data = res.data.data || {};
      setMatchpercent(data.matchPercent || 0);
      setNewpercent(data.newPercent || 0);
      setGeminireview([data.review, data.recommendation, data.matchingAreas?.join?.("\n"), data.newAreas?.join?.("\n")].filter(Boolean).join("\n\n"));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to review change");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!cycleid || !assignmentid || !newsyllabus || !assessmentscheme) {
      setError("Please select cycle, course and enter syllabus and assessment scheme");
      return;
    }
    try {
      setLoading(true);
      await ep1.post("/api/v2/bos/course-review/save", {
        colid: global1.colid,
        user: global1.user,
        cycleid,
        assignmentid,
        oldsyllabus,
        newsyllabus,
        assessmentscheme,
        geminisuggestion,
        geminireview,
        matchpercent,
        newpercent,
        facultymessage,
        facultyname: global1.name,
        facultyemail: global1.user
      });
      setMessage("Course review saved and sent for approval");
      await loadBase();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save course review");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "cycletitle", headerName: "Cycle", width: 180 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "matchpercent", headerName: "Match %", width: 110 },
    { field: "newpercent", headerName: "New %", width: 100 },
    { field: "status", headerName: "Status", width: 150 }
  ];

  return (
    <MenuPageShell title="BoS Course Review">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField select fullWidth label="BoS Cycle" value={cycleid} onChange={(e) => setCycleid(e.target.value)}>{cycles.map((c) => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}><TextField select fullWidth label="Assigned Course" value={assignmentid} onChange={(e) => setAssignmentid(e.target.value)}>{assignments.map((a) => <MenuItem key={a._id} value={a._id}>{a.coursecode} - {a.course} ({a.programcode}, Sem {a.semester})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={loading} startIcon={<AutoFixHigh />} onClick={suggest}>Gemini Suggest</Button></Grid>
          </Grid>
          {selectedAssignment && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{selectedAssignment.program} | {selectedAssignment.subject} | {selectedAssignment.regulation}</Typography>}
        </Paper>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={10} label="Existing syllabus" value={oldsyllabus} onChange={(e) => setOldsyllabus(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={10} label="New syllabus / changes" value={newsyllabus} onChange={(e) => setNewsyllabus(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={7} label="Assessment scheme with rubrics for 100%" value={assessmentscheme} onChange={(e) => setAssessmentscheme(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={7} label="Gemini review / comments" value={geminireview} onChange={(e) => setGeminireview(e.target.value)} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Matching %" value={matchpercent} onChange={(e) => setMatchpercent(e.target.value)} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth type="number" label="New %" value={newpercent} onChange={(e) => setNewpercent(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Faculty comments" value={facultymessage} onChange={(e) => setFacultymessage(e.target.value)} /></Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" disabled={loading} startIcon={<FactCheck />} onClick={review}>Gemini Review My Changes</Button>
              <Button variant="contained" disabled={loading} startIcon={<Save />} onClick={save}>Save and Send for Approval</Button>
            </Stack>
          </Grid>
        </Grid>
        <Paper sx={{ p: 1, mt: 2 }}>
          <Box sx={{ mb: 1 }}><Typography variant="h6" fontWeight={800}>My Course Reviews</Typography></Box>
          <DataGrid rows={reviews.map((r) => ({ ...r, id: r._id }))} columns={columns} autoHeight slots={{ toolbar: GridToolbar }} />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
