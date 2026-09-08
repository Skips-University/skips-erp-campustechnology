import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedIcon from "@mui/icons-material/Verified";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const uniq = (items) => [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const paperLabel = (row) => `${row.course || ""}${row.coursecode ? ` (${row.coursecode})` : ""} - ${row.programcode || ""}`;
const paperStatuses = ["Default", "Backup", "Emergency", "Reserve"];
const blockchainVerificationUrl = (paper = {}) => {
  if (!paper?._id) return "";
  const params = new URLSearchParams({ paperid: String(paper._id) });
  if (paper.blockchainhash) params.set("hash", paper.blockchainhash);
  return `${window.location.origin}/verify-question-paper-blockchain?${params.toString()}`;
};

export default function ConductExamReviewPapersPage() {
  const [courses, setCourses] = useState([]);
  const [papers, setPapers] = useState([]);
  const [paper, setPaper] = useState(null);
  const [selectedPaperIds, setSelectedPaperIds] = useState([]);
  const [bulkPaperStatus, setBulkPaperStatus] = useState("Default");
  const [audit, setAudit] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", examcode: "", regulation: "", programcode: "", coursecode: "", papersetteremail: "" });
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [storing, setStoring] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const dropdowns = useMemo(() => {
    const byYear = courses.filter((row) => !filters.academicyear || row.academicyear === filters.academicyear);
    const byExam = byYear.filter((row) => !filters.examcode || row.examcode === filters.examcode);
    const byRegulation = byExam.filter((row) => !filters.regulation || row.regulation === filters.regulation);
    const byProgram = byRegulation.filter((row) => !filters.programcode || row.programcode === filters.programcode);
    const programMap = new Map();
    byRegulation.forEach((row) => {
      if (row.programcode) programMap.set(row.programcode, { programcode: row.programcode, program: row.program });
    });
    const courseMap = new Map();
    byProgram.forEach((row) => {
      if (row.coursecode) courseMap.set(row.coursecode, row);
    });
    return {
      academicyears: uniq(courses.map((row) => row.academicyear)),
      exams: uniq(byYear.map((row) => `${row.examcode}||${row.exam}`)).map((value) => {
        const [examcode, exam] = value.split("||");
        return { examcode, exam };
      }),
      regulations: uniq(byExam.map((row) => row.regulation)),
      programs: [...programMap.values()].sort((a, b) => a.program.localeCompare(b.program)),
      coursesList: [...courseMap.values()].sort((a, b) => a.course.localeCompare(b.course)),
      paperSetters: uniq(papers.map((row) => `${row.papersetteremail}||${row.papersettername}`)).map((value) => {
        const [email, name] = value.split("||");
        return { email, name };
      })
    };
  }, [courses, filters, papers]);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/review-options", { params: { colid: global1.colid } });
    setCourses(res.data?.courses || []);
  };

  const loadPapers = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/conductexam/review-papers", { params });
      setPapers(res.data?.data || []);
      setPaper(null);
      setSelectedPaperIds([]);
      setAudit([]);
      setBlocks([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load review papers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
    loadPapers();
  }, []);

  const loadDetails = async (paperid) => {
    if (!paperid) return;
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/review-paper-details", { params: { colid: global1.colid, paperid } });
      setPaper(res.data?.paper || null);
      setAudit(res.data?.audit || []);
      setBlocks(res.data?.blocks || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load paper details.");
    } finally {
      setLoading(false);
    }
  };

  const setCourseDetails = (coursecode) => {
    const selected = dropdowns.coursesList.find((row) => row.coursecode === coursecode);
    setFilters((prev) => ({
      ...prev,
      coursecode,
      course: selected?.course || ""
    }));
  };

  const selectedIdsOrCurrent = () => selectedPaperIds.length ? selectedPaperIds : (paper?._id ? [paper._id] : []);

  const refreshChangedRows = (changedRows = []) => {
    setPapers((prev) => prev.map((row) => changedRows.find((item) => item._id === row._id) || row));
    if (paper?._id) {
      const changedPaper = changedRows.find((item) => item._id === paper._id);
      if (changedPaper) setPaper(changedPaper);
    }
  };

  const updatePaperStatus = async () => {
    const paperids = selectedIdsOrCurrent();
    if (!paperids.length) return;
    try {
      setAccepting(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/conductexam/review-paper-status", {
        colid: global1.colid,
        paperids,
        paperstatus: bulkPaperStatus,
        user: global1.user
      });
      refreshChangedRows(res.data?.data || []);
      setMessage(res.data?.message || "Paper status updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update paper status.");
    } finally {
      setAccepting(false);
    }
  };

  const acceptPaper = async () => {
    const paperids = selectedIdsOrCurrent();
    if (!paperids.length) return;
    try {
      setAccepting(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/conductexam/review-paper-accept", { colid: global1.colid, paperids, user: global1.user });
      refreshChangedRows(res.data?.data || []);
      setMessage(res.data?.message || "Question paper accepted.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to accept question paper.");
    } finally {
      setAccepting(false);
    }
  };

  const storeBlockchain = async () => {
    const paperids = selectedIdsOrCurrent();
    if (!paperids.length) return;
    try {
      setStoring(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/conductexam/review-paper-blockchain-store", {
        colid: global1.colid,
        paperids,
        user: global1.user,
        origin: window.location.origin
      });
      const changedRows = (res.data?.results || []).map((item) => item.paper).filter(Boolean);
      refreshChangedRows(changedRows);
      setMessage(res.data?.message || "Question paper stored in blockchain.");
      if (paper?._id) await loadDetails(paper._id);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to store question paper in blockchain.");
    } finally {
      setStoring(false);
    }
  };

  const paperColumns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "exam", headerName: "Exam", minWidth: 180, flex: 1 },
    { field: "examcode", headerName: "Exam Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "program", headerName: "Program", width: 170 },
    { field: "course", headerName: "Course", minWidth: 220, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "papersettername", headerName: "Paper Setter", width: 190 },
    { field: "status", headerName: "Status", width: 160 },
    { field: "paperstatus", headerName: "Paper Status", width: 150 },
    { field: "blockchainhash", headerName: "Blockchain Hash", minWidth: 240, flex: 1 }
  ];

  const auditColumns = [
    { field: "createdAt", headerName: "Time", width: 190, valueGetter: (params) => params.row.createdAt ? new Date(params.row.createdAt).toLocaleString() : "" },
    { field: "action", headerName: "Action", width: 170 },
    { field: "sectionindex", headerName: "Section", width: 90 },
    { field: "questionindex", headerName: "Question", width: 100 },
    { field: "oldquestion", headerName: "Old Question", minWidth: 220, flex: 1 },
    { field: "newquestion", headerName: "New Question", minWidth: 220, flex: 1 },
    { field: "comments", headerName: "Comments", minWidth: 220, flex: 1 },
    { field: "actorname", headerName: "Actor", width: 160 }
  ];

  return (
    <MenuPageShell title="Review Papers">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Review Papers</Typography>
              <Typography color="text.secondary">Review final question papers, audit trail, accept and store in blockchain.</Typography>
            </Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
              <TextField select size="small" label="Paper status" value={bulkPaperStatus} onChange={(event) => setBulkPaperStatus(event.target.value)} sx={{ minWidth: 170 }}>
                {paperStatuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
              </TextField>
              <Button variant="outlined" disabled={!selectedIdsOrCurrent().length || accepting} onClick={updatePaperStatus}>
                Update Status
              </Button>
              <Button variant="contained" color="success" startIcon={accepting ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />} disabled={!selectedIdsOrCurrent().length || accepting} onClick={acceptPaper}>{accepting ? "Accepting..." : `Accept ${selectedPaperIds.length ? `(${selectedPaperIds.length})` : ""}`}</Button>
              <Button variant="contained" startIcon={storing ? <CircularProgress size={18} color="inherit" /> : <VerifiedIcon />} disabled={!selectedIdsOrCurrent().length || storing} onClick={storeBlockchain}>{storing ? "Storing..." : `Store Blockchain ${selectedPaperIds.length ? `(${selectedPaperIds.length})` : ""}`}</Button>
            </Stack>
          </Stack>
          {(loading || accepting || storing) && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters({ ...filters, academicyear: e.target.value, examcode: "", regulation: "", programcode: "", coursecode: "" })}><MenuItem value="">All</MenuItem>{dropdowns.academicyears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2.5}><TextField select fullWidth label="Exam" value={filters.examcode} onChange={(e) => setFilters({ ...filters, examcode: e.target.value, regulation: "", programcode: "", coursecode: "" })}><MenuItem value="">All</MenuItem>{dropdowns.exams.map((item) => <MenuItem key={item.examcode} value={item.examcode}>{item.examcode} - {item.exam}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Regulation" value={filters.regulation} onChange={(e) => setFilters({ ...filters, regulation: e.target.value, programcode: "", coursecode: "" })}><MenuItem value="">All</MenuItem>{dropdowns.regulations.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2.5}><TextField select fullWidth label="Program" value={filters.programcode} onChange={(e) => setFilters({ ...filters, programcode: e.target.value, coursecode: "" })}><MenuItem value="">All</MenuItem>{dropdowns.programs.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Course" value={filters.coursecode} onChange={(e) => setCourseDetails(e.target.value)}><MenuItem value="">All</MenuItem>{dropdowns.coursesList.map((item) => <MenuItem key={item.coursecode} value={item.coursecode}>{paperLabel(item)}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Paper Setter" value={filters.papersetteremail} onChange={(e) => setFilters({ ...filters, papersetteremail: e.target.value })}><MenuItem value="">All</MenuItem>{dropdowns.paperSetters.map((item) => <MenuItem key={item.email} value={item.email}>{item.name} ({item.email})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={loading} onClick={() => loadPapers()} sx={{ height: 56 }}>{loading ? "Loading..." : "Load"}</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Box sx={{ height: 340 }}>
            <DataGrid
              rows={papers}
              getRowId={(row) => row._id}
              columns={paperColumns}
              loading={loading}
              checkboxSelection
              rowSelectionModel={selectedPaperIds}
              onRowSelectionModelChange={(model) => setSelectedPaperIds(model)}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "review_papers" } } }}
              onRowClick={(params) => loadDetails(params.row._id)}
              pageSizeOptions={[10, 25, 50]}
            />
          </Box>
        </Paper>

        {paper && (
          <Stack spacing={2}>
            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <Grid container spacing={1.5}>
                {[
                  ["Paper", paperLabel(paper)],
                  ["Exam", `${paper.exam} (${paper.examcode})`],
                  ["Program", `${paper.program} (${paper.programcode})`],
                  ["Regulation", paper.regulation],
                  ["Subject", paper.subject],
                  ["Semester", paper.semester],
                  ["Paper Setter", `${paper.papersettername} (${paper.papersetteremail})`],
                  ["Status", paper.status],
                  ["Paper Status", paper.paperstatus || "Default"]
                ].map(([label, value]) => <Grid item xs={12} md={3} key={label}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography fontWeight={800}>{value || "-"}</Typography></Grid>)}
                {(paper.blockchainverificationurl || paper.blockchainhash) && (
                  <Grid item xs={12}>
                    <Alert severity="success">
                      Blockchain verification URL: <a href={blockchainVerificationUrl(paper)} target="_blank" rel="noreferrer">{blockchainVerificationUrl(paper)}</a>
                    </Alert>
                  </Grid>
                )}
                {!!blocks.length && <Grid item xs={12}><Chip color="success" label={`${blocks.length} blockchain record(s) stored`} /></Grid>}
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Final Question Paper</Typography>
              <Stack spacing={2}>
                {(paper.sections || []).map((section, sectionIndex) => (
                  <Card key={section._id || sectionIndex} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={900}>{section.title || `Section ${sectionIndex + 1}`}</Typography>
                          {section.instructions && <Typography color="text.secondary">{section.instructions}</Typography>}
                        </Box>
                        <Chip label={`Marks: ${section.marks || 0}`} />
                      </Stack>
                      <Stack spacing={2}>
                        {(section.questions || []).map((question, questionIndex) => (
                          <Paper key={question._id || questionIndex} variant="outlined" sx={{ p: 2, bgcolor: "#fbfdff" }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                              <Chip size="small" label={`Q${questionIndex + 1}`} />
                              <Chip size="small" label={`${question.marks || 0} marks`} />
                              <Chip size="small" label={question.questiontype || "Question"} />
                              <Chip size="small" label={`CO: ${question.conumber || question.co || "-"}`} />
                              <Chip size="small" label={`Bloom: ${(question.bloomlevels || []).join(", ") || "-"}`} />
                            </Stack>
                            <Typography sx={{ whiteSpace: "pre-wrap", fontWeight: 700 }}>{question.question || "-"}</Typography>
                            {question.answer && <Typography sx={{ mt: 1, whiteSpace: "pre-wrap" }}><b>Answer:</b> {question.answer}</Typography>}
                          </Paper>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Audit Trail</Typography>
              <Box sx={{ height: 420 }}>
                <DataGrid rows={audit} getRowId={(row) => row._id} columns={auditColumns} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "question_paper_audit" } } }} pageSizeOptions={[10, 25, 50]} />
              </Box>
            </Paper>
          </Stack>
        )}
      </Box>
    </MenuPageShell>
  );
}
