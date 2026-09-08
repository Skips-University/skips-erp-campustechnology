import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
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
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const questionTypes = ["MCQ", "Short Answer Type", "Long answer Type", "Case Studies"];
const difficulties = ["Easy", "Medium", "Hard"];
const languages = ["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia", "Assamese", "Urdu", "Sanskrit", "German", "Spanish", "Italian", "French"];
const geminiModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];

const emptyQuestion = {
  question: "",
  questiontype: "Short Answer Type",
  difficultylevel: "Medium",
  language: "English",
  marks: 0,
  bloomlevels: [],
  conumber: "",
  co: "",
  attachmenturl: "",
  attachmentfilename: "",
  aimappingcomments: ""
};

const emptyGenerate = {
  sectionIndex: 0,
  count: 5,
  questiontype: "Short Answer Type",
  difficultylevel: "Medium",
  language: "English",
  geminiModel: "gemini-2.5-flash",
  bloomlevels: [],
  conumber: "",
  syllabusMode: "Complete Syllabus",
  selectedModules: [],
  selectedTopics: []
};

const uniq = (items) => [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const paperLabel = (row) => `${row.course || ""}${row.coursecode ? ` (${row.coursecode})` : ""} - ${row.programcode || ""}`;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
const uncheckedIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const renderCheckboxOption = (props, option, { selected }) => (
  <li {...props}>
    <Checkbox icon={uncheckedIcon} checkedIcon={checkedIcon} checked={selected} sx={{ mr: 1 }} />
    {option}
  </li>
);

export default function ConductExamSubmitQuestionPaperPage() {
  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState("");
  const [paperDoc, setPaperDoc] = useState(null);
  const [cos, setCos] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", examcode: "" });
  const [sections, setSections] = useState([]);
  const [paperAttachment, setPaperAttachment] = useState({ url: "", filename: "" });
  const [status, setStatus] = useState("Draft");
  const [generateForm, setGenerateForm] = useState(emptyGenerate);
  const [syllabusContext, setSyllabusContext] = useState({ complete: [], covered: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedPaper = useMemo(() => papers.find((row) => row._id === selectedPaperId) || null, [papers, selectedPaperId]);
  const paperSubmitted = /^(InvigilatorSubmitted|Moderation In Progress|Moderation Submitted|Accepted)$/i.test(status || "");
  const filterOptions = useMemo(() => ({
    academicyear: uniq(papers.map((row) => row.academicyear)),
    examcode: uniq(papers.map((row) => row.examcode))
  }), [papers]);
  const coOptions = useMemo(() => cos.map((item) => ({
    conumber: item.conumber || "",
    co: item.co || "",
    label: `${item.conumber || "CO"} - ${item.co || ""}`
  })), [cos]);
  const moduleOptions = useMemo(() => uniq(syllabusContext.complete.map((row) => row.module)), [syllabusContext.complete]);
  const topicOptions = useMemo(() => {
    const selectedModules = generateForm.selectedModules || [];
    const rows = selectedModules.length ? syllabusContext.complete.filter((row) => selectedModules.includes(row.module)) : syllabusContext.complete;
    return uniq(rows.flatMap((row) => row.topics || []));
  }, [syllabusContext.complete, generateForm.selectedModules]);
  const coveredWorkOptions = useMemo(() => uniq(syllabusContext.coveredWorkCompleted || syllabusContext.covered.flatMap((row) => row.topics || [])), [syllabusContext]);

  const loadPapers = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid, papersetteremail: global1.user };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/conductexam/papersetter-assigned-papers", { params });
      setPapers(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assigned papers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPapers();
  }, []);

  const loadQuestionPaper = async (paperId) => {
    if (!paperId) return;
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/question-paper", { params: { colid: global1.colid, papersetterid: paperId } });
      const doc = res.data?.paper || null;
      setPaperDoc(doc);
      setCos(res.data?.cos || []);
      setSections(doc?.sections?.length ? doc.sections : [{ title: "Section A", instructions: "", marks: 0, questions: [] }]);
      setPaperAttachment({ url: doc?.paperattachmenturl || "", filename: doc?.paperattachmentfilename || "" });
      setStatus(doc?.status || "Draft");
      setGenerateForm(emptyGenerate);
      const setter = res.data?.setter || {};
      const contextRes = await ep1.get("/api/v2/conductexam/question-paper-syllabus-context", {
        params: {
          colid: global1.colid,
          academicyear: setter.academicyear,
          regulation: setter.regulation,
          program: setter.program,
          programcode: setter.programcode,
          type: setter.type,
          subject: setter.subject,
          semester: setter.semester,
          course: setter.course,
          coursecode: setter.coursecode,
          papersetteremail: global1.user
        }
      });
      setSyllabusContext({
        complete: contextRes.data?.complete || [],
        covered: contextRes.data?.covered || [],
        coveredWorkCompleted: contextRes.data?.coveredWorkCompleted || []
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load question paper.");
    } finally {
      setLoading(false);
    }
  };

  const updateSection = (index, patch) => setSections((prev) => prev.map((section, itemIndex) => itemIndex === index ? { ...section, ...patch } : section));
  const addSection = () => setSections((prev) => [...prev, { title: `Section ${String.fromCharCode(65 + prev.length)}`, instructions: "", marks: 0, questions: [] }]);
  const deleteSection = (index) => setSections((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  const addQuestion = (sectionIndex, question = emptyQuestion) => setSections((prev) => prev.map((section, itemIndex) => itemIndex === sectionIndex ? { ...section, questions: [...(section.questions || []), { ...emptyQuestion, ...question }] } : section));
  const updateQuestion = (sectionIndex, questionIndex, patch) => setSections((prev) => prev.map((section, itemIndex) => {
    if (itemIndex !== sectionIndex) return section;
    return { ...section, questions: (section.questions || []).map((question, qIndex) => qIndex === questionIndex ? { ...question, ...patch } : question) };
  }));
  const deleteQuestion = (sectionIndex, questionIndex) => setSections((prev) => prev.map((section, itemIndex) => itemIndex === sectionIndex ? { ...section, questions: (section.questions || []).filter((_, qIndex) => qIndex !== questionIndex) } : section));

  const uploadAttachment = async (file, kind, sectionIndex, questionIndex) => {
    if (!file) return;
    try {
      setUploadingKey(`${kind}-${sectionIndex}-${questionIndex}`);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("colid", global1.colid);
      const res = await ep1.post("/api/v2/conductexam/question-paper-upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const data = res.data?.data || {};
      if (kind === "paper") setPaperAttachment({ url: data.url || "", filename: data.filename || file.name });
      else updateQuestion(sectionIndex, questionIndex, { attachmenturl: data.url || "", attachmentfilename: data.filename || file.name });
      setMessage("Attachment uploaded.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload attachment.");
    } finally {
      setUploadingKey("");
    }
  };

  const saveQuestionPaper = async () => {
    if (!selectedPaper) {
      setError("Select an assigned paper.");
      return;
    }
    if (paperSubmitted) {
      setError("Question paper is already submitted for moderation and cannot be edited.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/conductexam/question-paper", {
        colid: global1.colid,
        user: global1.user,
        papersetterid: selectedPaper._id,
        status,
        paperattachmenturl: paperAttachment.url,
        paperattachmentfilename: paperAttachment.filename,
        sections
      });
      setMessage("Question paper saved.");
      await loadQuestionPaper(selectedPaper._id);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save question paper.");
    } finally {
      setSaving(false);
    }
  };

  const submitQuestionPaper = async () => {
    if (!selectedPaper) {
      setError("Select an assigned paper.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/conductexam/question-paper-submit", {
        colid: global1.colid,
        user: global1.user,
        papersetterid: selectedPaper._id
      });
      setPaperDoc(res.data?.data || null);
      setStatus(res.data?.data?.status || "InvigilatorSubmitted");
      setMessage("Question paper submitted for moderation.");
      await loadPapers();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit question paper.");
    } finally {
      setSubmitting(false);
    }
  };

  const generateQuestions = async () => {
    if (!selectedPaper) return setError("Select an assigned paper.");
    if (paperSubmitted) return setError("Question paper is already submitted for moderation and cannot be edited.");
    if (!generateForm.selectedModules?.length && !generateForm.selectedTopics?.length) {
      return setError(`Select at least one module or topic from ${generateForm.syllabusMode}.`);
    }
    try {
      setGenerating(true);
      setError("");
      const co = coOptions.find((item) => item.conumber === generateForm.conumber);
      const res = await ep1.post("/api/v2/conductexam/question-paper-generate", {
        colid: global1.colid,
        ...selectedPaper,
        ...generateForm,
        cos: coOptions
      });
      const questions = (res.data?.data || []).map((item) => ({
        ...emptyQuestion,
        ...item,
        conumber: item.conumber || co?.conumber || "",
        co: item.co || co?.co || "",
        bloomlevels: Array.isArray(item.bloomlevels) ? item.bloomlevels : generateForm.bloomlevels
      }));
      setSections((prev) => prev.map((section, index) => index === Number(generateForm.sectionIndex) ? { ...section, questions: [...(section.questions || []), ...questions] } : section));
      setMessage(`${questions.length} questions generated.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate questions.");
    } finally {
      setGenerating(false);
    }
  };

  const analyzeMapping = async () => {
    if (!selectedPaper) return setError("Select an assigned paper.");
    if (paperSubmitted) return setError("Question paper is already submitted for moderation and cannot be edited.");
    try {
      setMapping(true);
      setError("");
      const res = await ep1.post("/api/v2/conductexam/question-paper-ai-map", {
        colid: global1.colid,
        geminiModel: generateForm.geminiModel,
        cos: coOptions,
        sections
      });
      setSections(res.data?.data || sections);
      setMessage("AI mapping completed. Review and save the question paper.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to analyze CO/Bloom mapping.");
    } finally {
      setMapping(false);
    }
  };

  const paperColumns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "exam", headerName: "Exam", minWidth: 180, flex: 1 },
    { field: "examcode", headerName: "Exam Code", width: 140 },
    { field: "program", headerName: "Program", width: 160 },
    { field: "course", headerName: "Course", minWidth: 220, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "status", headerName: "Status", width: 120 }
  ];

  return (
    <MenuPageShell title="Submit Question Paper">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Submit Question Paper</Typography>
              <Typography color="text.secondary">Select an assigned paper, create sections and questions, upload attachments, and save.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} disabled={!selectedPaper || paperSubmitted || uploadingKey === "paper-0-0"}>
                {uploadingKey === "paper-0-0" ? "Uploading..." : "Upload Full Paper"}
                <input hidden type="file" onChange={(e) => uploadAttachment(e.target.files?.[0], "paper", 0, 0)} />
              </Button>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />} disabled={saving || !selectedPaper || paperSubmitted} onClick={saveQuestionPaper}>{saving ? "Saving..." : "Save Paper"}</Button>
              <Button variant="contained" color="success" startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <FactCheckIcon />} disabled={submitting || saving || !selectedPaper || paperSubmitted} onClick={submitQuestionPaper}>{submitting ? "Submitting..." : "Submit Paper"}</Button>
            </Stack>
          </Stack>
          {(loading || saving || submitting || generating || mapping) && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {selectedPaper && paperSubmitted && <Alert severity="info" sx={{ mb: 2 }}>This question paper has been submitted for moderation and is now read-only.</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}><TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters({ ...filters, academicyear: e.target.value })}><MenuItem value="">All</MenuItem>{filterOptions.academicyear.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Exam" value={filters.examcode} onChange={(e) => setFilters({ ...filters, examcode: e.target.value })}><MenuItem value="">All</MenuItem>{filterOptions.examcode.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={loading} onClick={() => loadPapers()} sx={{ height: 56 }}>{loading ? "Loading..." : "Load Papers"}</Button></Grid>
            <Grid item xs={12} md={4}><TextField select fullWidth label="Assigned Paper" value={selectedPaperId} onChange={(e) => { setSelectedPaperId(e.target.value); loadQuestionPaper(e.target.value); }}><MenuItem value="">Select</MenuItem>{papers.map((item) => <MenuItem key={item._id} value={item._id}>{paperLabel(item)}</MenuItem>)}</TextField></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Box sx={{ height: 280 }}>
            <DataGrid rows={papers} getRowId={(row) => row._id} columns={paperColumns} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} onRowClick={(params) => { setSelectedPaperId(params.row._id); loadQuestionPaper(params.row._id); }} pageSizeOptions={[5, 10, 25]} />
          </Box>
        </Paper>

        {selectedPaper && (
          <>
            <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <Grid container spacing={1.5}>
                {[
                  ["Paper", paperLabel(selectedPaper)],
                  ["Exam", `${selectedPaper.exam} (${selectedPaper.examcode})`],
                  ["Program", `${selectedPaper.program} (${selectedPaper.programcode})`],
                  ["Subject", selectedPaper.subject],
                  ["Semester", selectedPaper.semester],
                  ["Paper Setter", `${selectedPaper.papersettername} (${selectedPaper.papersetteremail})`]
                ].map(([label, value]) => <Grid item xs={12} md={4} key={label}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography fontWeight={800}>{value || "-"}</Typography></Grid>)}
                <Grid item xs={12} md={3}><TextField select fullWidth label="Status" value={status} disabled={paperSubmitted} onChange={(e) => setStatus(e.target.value)}><MenuItem value="Draft">Draft</MenuItem><MenuItem value="Submitted">Submitted</MenuItem><MenuItem value="InvigilatorSubmitted">InvigilatorSubmitted</MenuItem><MenuItem value="Moderation In Progress">Moderation In Progress</MenuItem><MenuItem value="Moderation Submitted">Moderation Submitted</MenuItem><MenuItem value="Accepted">Accepted</MenuItem></TextField></Grid>
                <Grid item xs={12} md={9}><TextField fullWidth label="Full question paper attachment link" value={paperAttachment.url} disabled={paperSubmitted} onChange={(e) => setPaperAttachment({ ...paperAttachment, url: e.target.value })} /></Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2, ...(paperSubmitted ? { pointerEvents: "none", opacity: 0.72 } : {}) }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Gemini Question Generation and Mapping</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2}><TextField select fullWidth label="Section" value={generateForm.sectionIndex} onChange={(e) => setGenerateForm({ ...generateForm, sectionIndex: e.target.value })}>{sections.map((section, index) => <MenuItem key={index} value={index}>{section.title || `Section ${index + 1}`}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={1.5}><TextField fullWidth type="number" label="No. of Questions" value={generateForm.count} onChange={(e) => setGenerateForm({ ...generateForm, count: e.target.value })} /></Grid>
                <Grid item xs={12} md={2}><TextField select fullWidth label="Question Type" value={generateForm.questiontype} onChange={(e) => setGenerateForm({ ...generateForm, questiontype: e.target.value })}>{questionTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={1.5}><TextField select fullWidth label="Difficulty" value={generateForm.difficultylevel} onChange={(e) => setGenerateForm({ ...generateForm, difficultylevel: e.target.value })}>{difficulties.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={2}><TextField select fullWidth label="Language" value={generateForm.language} onChange={(e) => setGenerateForm({ ...generateForm, language: e.target.value })}>{languages.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={2}><TextField select fullWidth label="Gemini Model" value={generateForm.geminiModel} onChange={(e) => setGenerateForm({ ...generateForm, geminiModel: e.target.value })}>{geminiModels.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={3}><Autocomplete multiple disableCloseOnSelect options={bloomLevels} value={generateForm.bloomlevels} onChange={(e, value) => setGenerateForm({ ...generateForm, bloomlevels: value })} renderInput={(params) => <TextField {...params} label="Bloom Levels" />} /></Grid>
                <Grid item xs={12} md={5}><TextField select fullWidth label="CO" value={generateForm.conumber} onChange={(e) => setGenerateForm({ ...generateForm, conumber: e.target.value })}><MenuItem value="">Auto</MenuItem>{coOptions.map((item) => <MenuItem key={item.conumber || item.co} value={item.conumber}>{item.label}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={3}>
                  <Paper variant="outlined" sx={{ px: 2, py: 1.2, borderRadius: 2, height: "100%", display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                      control={<Switch checked={generateForm.syllabusMode === "Covered Syllabus"} onChange={(e) => setGenerateForm((prev) => ({ ...prev, syllabusMode: e.target.checked ? "Covered Syllabus" : "Complete Syllabus", selectedModules: [], selectedTopics: [] }))} />}
                      label={generateForm.syllabusMode}
                    />
                  </Paper>
                </Grid>
                {generateForm.syllabusMode === "Complete Syllabus" ? (
                  <>
                    <Grid item xs={12} md={4}>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={moduleOptions}
                        value={generateForm.selectedModules || []}
                        onChange={(e, value) => setGenerateForm((prev) => ({ ...prev, selectedModules: value, selectedTopics: [] }))}
                        renderOption={renderCheckboxOption}
                        renderInput={(params) => <TextField {...params} label="Complete syllabus modules" helperText={`${moduleOptions.length} modules available`} />}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={topicOptions}
                        value={generateForm.selectedTopics || []}
                        onChange={(e, value) => setGenerateForm((prev) => ({ ...prev, selectedTopics: value }))}
                        renderOption={renderCheckboxOption}
                        renderInput={(params) => <TextField {...params} label="Complete syllabus topics/content" helperText={`${topicOptions.length} topics available`} />}
                      />
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12} md={9}>
                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={coveredWorkOptions}
                      value={generateForm.selectedTopics || []}
                      onChange={(e, value) => setGenerateForm((prev) => ({ ...prev, selectedModules: [], selectedTopics: value }))}
                      renderOption={renderCheckboxOption}
                      renderInput={(params) => <TextField {...params} label="Completed work" helperText={`${coveredWorkOptions.length} completed work entries available`} />}
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={2}><Button fullWidth variant="outlined" startIcon={generating ? <CircularProgress size={18} /> : <AutoFixHighIcon />} disabled={paperSubmitted || generating || mapping} onClick={generateQuestions} sx={{ height: 56 }}>{generating ? "Generating..." : "Generate"}</Button></Grid>
                <Grid item xs={12} md={2}><Button fullWidth variant="outlined" color="secondary" startIcon={mapping ? <CircularProgress size={18} /> : <FactCheckIcon />} disabled={paperSubmitted || generating || mapping} onClick={analyzeMapping} sx={{ height: 56 }}>{mapping ? "Mapping..." : "AI CO Mapping"}</Button></Grid>
              </Grid>
            </Paper>

            <Stack spacing={2} sx={paperSubmitted ? { pointerEvents: "none", opacity: 0.72 } : {}}>
              <Stack direction="row" spacing={1}><Button variant="contained" startIcon={<AddIcon />} disabled={paperSubmitted} onClick={addSection}>Add Section</Button><Chip label={`${sections.length} sections`} /></Stack>
              {sections.map((section, sectionIndex) => (
                <Card key={sectionIndex} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Grid item xs={12} md={3}><TextField fullWidth label="Section" value={section.title || ""} onChange={(e) => updateSection(sectionIndex, { title: e.target.value })} /></Grid>
                      <Grid item xs={12} md={6}><TextField fullWidth label="Instructions" value={section.instructions || ""} onChange={(e) => updateSection(sectionIndex, { instructions: e.target.value })} /></Grid>
                      <Grid item xs={12} md={1.5}><TextField fullWidth type="number" label="Marks" value={section.marks || 0} onChange={(e) => updateSection(sectionIndex, { marks: e.target.value })} /></Grid>
                      <Grid item xs={12} md={1.5}><Button fullWidth color="error" variant="outlined" onClick={() => deleteSection(sectionIndex)}>Delete</Button></Grid>
                    </Grid>
                    <Stack spacing={2}>
                      {(section.questions || []).map((question, questionIndex) => {
                        const selectedCo = coOptions.find((item) => item.conumber === question.conumber) || null;
                        return (
                          <Paper key={questionIndex} variant="outlined" sx={{ p: 2, bgcolor: "#fbfdff" }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12}><TextField fullWidth multiline minRows={2} label={`Question ${questionIndex + 1}`} value={question.question || ""} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { question: e.target.value })} /></Grid>
                              <Grid item xs={12} md={2}><TextField select fullWidth label="Type" value={question.questiontype || "Short Answer Type"} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { questiontype: e.target.value })}>{questionTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                              <Grid item xs={12} md={2}><TextField select fullWidth label="Difficulty" value={question.difficultylevel || "Medium"} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { difficultylevel: e.target.value })}>{difficulties.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                              <Grid item xs={12} md={2}><TextField select fullWidth label="Language" value={question.language || "English"} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { language: e.target.value })}>{languages.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                              <Grid item xs={12} md={1}><TextField fullWidth type="number" label="Marks" value={question.marks || 0} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { marks: e.target.value })} /></Grid>
                              <Grid item xs={12} md={3}><Autocomplete multiple disableCloseOnSelect options={bloomLevels} value={question.bloomlevels || []} onChange={(e, value) => updateQuestion(sectionIndex, questionIndex, { bloomlevels: value })} renderInput={(params) => <TextField {...params} label="Bloom Levels" />} /></Grid>
                              <Grid item xs={12} md={2}><TextField select fullWidth label="CO" value={question.conumber || ""} onChange={(e) => {
                                const co = coOptions.find((item) => item.conumber === e.target.value);
                                updateQuestion(sectionIndex, questionIndex, { conumber: co?.conumber || "", co: co?.co || "" });
                              }}><MenuItem value="">Select</MenuItem>{coOptions.map((item) => <MenuItem key={item.conumber || item.co} value={item.conumber}>{item.label}</MenuItem>)}</TextField></Grid>
                              <Grid item xs={12} md={6}><TextField fullWidth label="Attachment link" value={question.attachmenturl || ""} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { attachmenturl: e.target.value })} /></Grid>
                              <Grid item xs={12} md={3}><Button fullWidth component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={uploadingKey === `question-${sectionIndex}-${questionIndex}`} sx={{ height: 56 }}>{uploadingKey === `question-${sectionIndex}-${questionIndex}` ? "Uploading..." : "Upload Attachment"}<input hidden type="file" onChange={(e) => uploadAttachment(e.target.files?.[0], "question", sectionIndex, questionIndex)} /></Button></Grid>
                              <Grid item xs={12} md={2}><Button fullWidth color="error" variant="outlined" onClick={() => deleteQuestion(sectionIndex, questionIndex)} sx={{ height: 56 }}>Delete Question</Button></Grid>
                              <Grid item xs={12}><TextField fullWidth label="AI Mapping Comments" value={question.aimappingcomments || ""} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { aimappingcomments: e.target.value })} /></Grid>
                              {selectedCo && <Grid item xs={12}><Alert severity="info">{selectedCo.label}</Alert></Grid>}
                            </Grid>
                          </Paper>
                        );
                      })}
                      <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addQuestion(sectionIndex)}>Add Question</Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </>
        )}
      </Box>
    </MenuPageShell>
  );
}
