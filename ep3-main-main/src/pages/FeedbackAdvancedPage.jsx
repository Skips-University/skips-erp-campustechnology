import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const academicYears = ["2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const languages = ["English", "French", "Spanish", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia", "Assamese", "Urdu", "Sanskrit"];
const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
const colors = ["#2563eb", "#14b8a6", "#f97316", "#8b5cf6", "#ef4444"];

const emptyForm = () => ({
  id: "",
  academicyear: "2026-27",
  title: "",
  description: "",
  instructions: "",
  imagesText: "",
  linksText: "",
  startdate: "",
  enddate: "",
  status: "Active",
  sections: []
});

const linesToArray = (value) => String(value || "").split("\n").map((item) => item.trim()).filter(Boolean);
const linksFromText = (value) => linesToArray(value).map((url) => ({ label: url, url }));
const linksToText = (links = []) => links.map((item) => item.url || item.label || "").filter(Boolean).join("\n");
const imagesToText = (images = []) => images.join("\n");

const toFormState = (row) => ({
  id: row._id || "",
  academicyear: row.academicyear || "2026-27",
  title: row.title || "",
  description: row.description || "",
  instructions: row.instructions || "",
  imagesText: imagesToText(row.images || []),
  linksText: linksToText(row.links || []),
  startdate: row.startdate || "",
  enddate: row.enddate || "",
  status: row.status || "Active",
  sections: (row.sections || []).map((section) => ({
    _id: section._id,
    title: section.title || "",
    text: section.text || "",
    imagesText: imagesToText(section.images || []),
    linksText: linksToText(section.links || []),
    aiTopic: "",
    aiCount: 5,
    aiModel: "gemini-2.5-flash",
    aiLanguage: "English",
    aiQuestionType: "5 Point Scale",
    generating: false,
    questions: (section.questions || []).map((question) => ({
      _id: question._id,
      question: question.question || "",
      type: question.type || "5 Point Scale",
      imagesText: imagesToText(question.images || []),
      linksText: linksToText(question.links || []),
      required: question.required || "Yes"
    }))
  }))
});

const toPayload = (form) => ({
  id: form.id,
  colid: global1.colid,
  user: global1.user,
  academicyear: form.academicyear,
  title: form.title,
  description: form.description,
  instructions: form.instructions,
  images: linesToArray(form.imagesText),
  links: linksFromText(form.linksText),
  startdate: form.startdate,
  enddate: form.enddate,
  status: form.status,
  sections: form.sections.map((section) => ({
    _id: section._id,
    title: section.title,
    text: section.text,
    images: linesToArray(section.imagesText),
    links: linksFromText(section.linksText),
    questions: section.questions.map((question) => ({
      _id: question._id,
      question: question.question,
      type: question.type,
      images: linesToArray(question.imagesText),
      links: linksFromText(question.linksText),
      required: question.required
    }))
  }))
});

function MediaLinks({ images = [], links = [] }) {
  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      {images.map((url, index) => (
        <Box key={url + index} component="img" src={url} alt="" sx={{ maxHeight: 160, maxWidth: "100%", borderRadius: 1, objectFit: "contain", border: "1px solid #ddd" }} />
      ))}
      {links.map((link, index) => (
        <Button key={(link.url || link.label) + index} href={link.url} target="_blank" rel="noreferrer" size="small" sx={{ alignSelf: "flex-start" }}>
          {link.label || link.url}
        </Button>
      ))}
    </Stack>
  );
}

export default function FeedbackAdvancedPage() {
  const [tab, setTab] = useState(0);
  const [forms, setForms] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [analysisForm, setAnalysisForm] = useState("");
  const [analysisYear, setAnalysisYear] = useState("2026-27");
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [sentimentLoading, setSentimentLoading] = useState("");
  const [overallSentiment, setOverallSentiment] = useState("");
  const [uploadingImage, setUploadingImage] = useState("");

  const loadForms = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/feedback-advanced/forms", { params: { colid: global1.colid } });
      setForms(res.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load feedback forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const setFormField = (field, value) => setForm((old) => ({ ...old, [field]: value }));
  const updateSection = (index, patch) => setForm((old) => ({ ...old, sections: old.sections.map((item, idx) => (idx === index ? { ...item, ...patch } : item)) }));
  const updateQuestion = (sectionIndex, questionIndex, patch) =>
    setForm((old) => ({
      ...old,
      sections: old.sections.map((section, idx) =>
        idx === sectionIndex
          ? { ...section, questions: section.questions.map((question, qidx) => (qidx === questionIndex ? { ...question, ...patch } : question)) }
          : section
      )
    }));

  const appendImageUrl = (scope, url) => {
    if (!url) return;
    if (scope.type === "form") {
      setForm((old) => ({ ...old, imagesText: [old.imagesText, url].filter(Boolean).join("\n") }));
    } else if (scope.type === "section") {
      const section = form.sections[scope.sectionIndex];
      updateSection(scope.sectionIndex, { imagesText: [section?.imagesText, url].filter(Boolean).join("\n") });
    } else if (scope.type === "question") {
      const question = form.sections[scope.sectionIndex]?.questions?.[scope.questionIndex];
      updateQuestion(scope.sectionIndex, scope.questionIndex, { imagesText: [question?.imagesText, url].filter(Boolean).join("\n") });
    }
  };

  const uploadImage = async (file, scope) => {
    if (!file) return;
    if (!/^image\//i.test(file.type || "")) {
      setMessage("Please select an image file.");
      return;
    }
    const uploadKey = `${scope.type}-${scope.sectionIndex ?? "form"}-${scope.questionIndex ?? ""}`;
    setUploadingImage(uploadKey);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("colid", global1.colid);
      formData.append("folder", `${scope.type}-${form.academicyear || "year"}`);
      const res = await ep1.post("/api/v2/feedback-advanced/upload-image", formData, { headers: { "Content-Type": "multipart/form-data" } });
      appendImageUrl(scope, res.data.url);
      setMessage("Image uploaded and link added.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to upload image");
    } finally {
      setUploadingImage("");
    }
  };

  const ImageUploadButton = ({ scope, label = "Upload image" }) => {
    const uploadKey = `${scope.type}-${scope.sectionIndex ?? "form"}-${scope.questionIndex ?? ""}`;
    const inputId = `feedback-image-${uploadKey}`;
    return (
      <>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            uploadImage(e.target.files?.[0], scope);
            e.target.value = "";
          }}
        />
        <Button
          component="label"
          htmlFor={inputId}
          size="small"
          variant="outlined"
          startIcon={uploadingImage === uploadKey ? <CircularProgress size={14} /> : <UploadFileIcon />}
          disabled={uploadingImage === uploadKey}
          sx={{ mt: 1 }}
        >
          {label}
        </Button>
      </>
    );
  };

  const addSection = () => {
    setForm((old) => ({
      ...old,
      sections: [
        ...old.sections,
        { title: `Section ${old.sections.length + 1}`, text: "", imagesText: "", linksText: "", aiTopic: "", aiCount: 5, aiModel: "gemini-2.5-flash", aiLanguage: "English", aiQuestionType: "5 Point Scale", generating: false, questions: [] }
      ]
    }));
  };

  const addQuestion = (sectionIndex, generated = {}) => {
    setForm((old) => ({
      ...old,
      sections: old.sections.map((section, idx) =>
        idx === sectionIndex
          ? {
              ...section,
              questions: [
                ...section.questions,
                { question: generated.question || "", type: generated.type || "5 Point Scale", imagesText: "", linksText: "", required: "Yes" }
              ]
            }
          : section
      )
    }));
  };

  const generateQuestions = async (sectionIndex) => {
    const section = form.sections[sectionIndex];
    if (!section?.aiTopic) {
      setMessage("Please enter a topic before generating questions.");
      return;
    }
    updateSection(sectionIndex, { generating: true });
    try {
      const res = await ep1.post("/api/v2/feedback-advanced/generate-questions", {
        colid: global1.colid,
        topic: section.aiTopic,
        count: section.aiCount,
        model: section.aiModel,
        language: section.aiLanguage,
        questiontype: section.aiQuestionType
      });
      setForm((old) => ({
        ...old,
        sections: old.sections.map((item, idx) =>
          idx === sectionIndex
            ? {
                ...item,
                generating: false,
                questions: [
                  ...item.questions,
                  ...(res.data.questions || []).map((question) => ({ ...question, imagesText: "", linksText: "", required: "Yes" }))
                ]
              }
            : item
        )
      }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to generate questions");
      updateSection(sectionIndex, { generating: false });
    }
  };

  const saveForm = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/feedback-advanced/forms", toPayload(form));
      setForm(toFormState(res.data.data));
      setMessage("Feedback form saved.");
      await loadForms();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save feedback form");
    } finally {
      setSaving(false);
    }
  };

  const deleteForm = async (row) => {
    if (!window.confirm("Delete this feedback form?")) return;
    try {
      await ep1.post("/api/v2/feedback-advanced/forms-delete", { colid: global1.colid, id: row._id });
      await loadForms();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete feedback form");
    }
  };

  const publicLink = (row) => `${window.location.origin}/feedback-advanced-public?colid=${global1.colid}&formid=${row._id || form.id}`;

  const loadAnalysis = async () => {
    if (!analysisForm) {
      setMessage("Select a feedback form for analysis.");
      return;
    }
    setAnalysisLoading(true);
    try {
      const res = await ep1.get("/api/v2/feedback-advanced/analysis", {
        params: { colid: global1.colid, formid: analysisForm, academicyear: analysisYear }
      });
      setAnalysis(res.data);
      setOverallSentiment("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load analysis");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const analyzeSentiment = async (question) => {
    setSentimentLoading(question.questionid);
    try {
      const res = await ep1.post("/api/v2/feedback-advanced/analyze-sentiment", {
        colid: global1.colid,
        formid: analysisForm,
        questionid: question.questionid,
        model: "gemini-2.5-flash"
      });
      setAnalysis((old) => ({
        ...old,
        questions: old.questions.map((item) => (item.questionid === question.questionid ? { ...item, sentiment: res.data.analysis } : item))
      }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to analyze sentiment");
    } finally {
      setSentimentLoading("");
    }
  };

  const analyzeAllSentiment = async () => {
    if (!analysisForm) return;
    setSentimentLoading("__all__");
    try {
      const res = await ep1.post("/api/v2/feedback-advanced/analyze-sentiment", {
        colid: global1.colid,
        formid: analysisForm,
        questionid: "__all__",
        model: "gemini-2.5-flash"
      });
      setOverallSentiment(res.data.analysis);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to analyze all responses");
    } finally {
      setSentimentLoading("");
    }
  };

  const formRows = useMemo(() => forms.map((row, index) => ({ ...row, id: row._id, sr: index + 1 })), [forms]);

  const formColumns = [
    { field: "sr", headerName: "#", width: 70 },
    { field: "academicyear", headerName: "Academic year", width: 130 },
    { field: "title", headerName: "Title", flex: 1, minWidth: 220 },
    { field: "startdate", headerName: "Start date", width: 120 },
    { field: "enddate", headerName: "End date", width: 120 },
    { field: "status", headerName: "Status", width: 110 },
    {
      field: "actions",
      headerName: "Actions",
      width: 210,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => { setForm(toFormState(params.row)); setTab(0); }}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => deleteForm(params.row)}><DeleteIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => navigator.clipboard?.writeText(publicLink(params.row))}><ContentCopyIcon fontSize="small" /></IconButton>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Feedback advanced">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {message && <Alert sx={{ mb: 2 }} severity={message.includes("Unable") ? "error" : "success"} onClose={() => setMessage("")}>{message}</Alert>}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            <Tab label="Create feedback" />
            <Tab label="Forms and links" />
            <Tab label="Analysis" />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Academic year</InputLabel>
                    <Select label="Academic year" value={form.academicyear} onChange={(e) => setFormField("academicyear", e.target.value)}>
                      {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Feedback title" value={form.title} onChange={(e) => setFormField("title", e.target.value)} /></Grid>
                <Grid item xs={12} md={2}><TextField fullWidth size="small" type="date" label="Start date" InputLabelProps={{ shrink: true }} value={form.startdate} onChange={(e) => setFormField("startdate", e.target.value)} /></Grid>
                <Grid item xs={12} md={2}><TextField fullWidth size="small" type="date" label="End date" InputLabelProps={{ shrink: true }} value={form.enddate} onChange={(e) => setFormField("enddate", e.target.value)} /></Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select label="Status" value={form.status} onChange={(e) => setFormField("status", e.target.value)}>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Description" value={form.description} onChange={(e) => setFormField("description", e.target.value)} /></Grid>
                <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="General instructions" value={form.instructions} onChange={(e) => setFormField("instructions", e.target.value)} /></Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth multiline minRows={2} label="General image URLs, one per line" value={form.imagesText} onChange={(e) => setFormField("imagesText", e.target.value)} />
                  <ImageUploadButton scope={{ type: "form" }} />
                </Grid>
                <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={2} label="General links, one per line" value={form.linksText} onChange={(e) => setFormField("linksText", e.target.value)} /></Grid>
              </Grid>
            </Paper>

            {form.sections.map((section, sectionIndex) => (
              <Paper key={sectionIndex} sx={{ p: 2, borderRadius: 2, borderLeft: "5px solid #2563eb" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Section {sectionIndex + 1}</Typography>
                  <IconButton color="error" onClick={() => setForm((old) => ({ ...old, sections: old.sections.filter((_, idx) => idx !== sectionIndex) }))}><DeleteIcon /></IconButton>
                </Stack>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Section title" value={section.title} onChange={(e) => updateSection(sectionIndex, { title: e.target.value })} /></Grid>
                  <Grid item xs={12} md={8}><TextField fullWidth size="small" label="Section text" value={section.text} onChange={(e) => updateSection(sectionIndex, { text: e.target.value })} /></Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth multiline minRows={2} label="Section image URLs, one per line" value={section.imagesText} onChange={(e) => updateSection(sectionIndex, { imagesText: e.target.value })} />
                    <ImageUploadButton scope={{ type: "section", sectionIndex }} />
                  </Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={2} label="Section links, one per line" value={section.linksText} onChange={(e) => updateSection(sectionIndex, { linksText: e.target.value })} /></Grid>
                </Grid>

                <Paper variant="outlined" sx={{ p: 2, mt: 2, background: "#f8fafc" }}>
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Gemini topic" value={section.aiTopic} onChange={(e) => updateSection(sectionIndex, { aiTopic: e.target.value })} /></Grid>
                    <Grid item xs={6} md={1.2}><TextField fullWidth size="small" type="number" label="No." value={section.aiCount} onChange={(e) => updateSection(sectionIndex, { aiCount: e.target.value })} /></Grid>
                    <Grid item xs={12} md={2}><FormControl fullWidth size="small"><InputLabel>Type</InputLabel><Select label="Type" value={section.aiQuestionType} onChange={(e) => updateSection(sectionIndex, { aiQuestionType: e.target.value })}><MenuItem value="5 Point Scale">5 Point Scale</MenuItem><MenuItem value="Short Answer Type">Short Answer Type</MenuItem></Select></FormControl></Grid>
                    <Grid item xs={12} md={2}><FormControl fullWidth size="small"><InputLabel>Model</InputLabel><Select label="Model" value={section.aiModel} onChange={(e) => updateSection(sectionIndex, { aiModel: e.target.value })}>{models.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
                    <Grid item xs={12} md={2}><FormControl fullWidth size="small"><InputLabel>Language</InputLabel><Select label="Language" value={section.aiLanguage} onChange={(e) => updateSection(sectionIndex, { aiLanguage: e.target.value })}>{languages.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
                    <Grid item xs={12} md={1.8}><Button fullWidth variant="contained" startIcon={section.generating ? <CircularProgress size={16} color="inherit" /> : <AutoFixHighIcon />} disabled={section.generating} onClick={() => generateQuestions(sectionIndex)}>Generate</Button></Grid>
                  </Grid>
                </Paper>

                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {section.questions.map((question, questionIndex) => (
                    <Paper key={questionIndex} variant="outlined" sx={{ p: 1.5 }}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} md={5}><TextField fullWidth size="small" label="Question" value={question.question} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { question: e.target.value })} /></Grid>
                        <Grid item xs={12} md={2}><FormControl fullWidth size="small"><InputLabel>Type</InputLabel><Select label="Type" value={question.type} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { type: e.target.value })}><MenuItem value="5 Point Scale">5 Point Scale</MenuItem><MenuItem value="Short Answer Type">Short Answer Type</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} md={2}>
                          <TextField fullWidth size="small" label="Image URLs" value={question.imagesText} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { imagesText: e.target.value })} />
                          <ImageUploadButton scope={{ type: "question", sectionIndex, questionIndex }} label="Upload" />
                        </Grid>
                        <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Links" value={question.linksText} onChange={(e) => updateQuestion(sectionIndex, questionIndex, { linksText: e.target.value })} /></Grid>
                        <Grid item xs={12} md={1}><IconButton color="error" onClick={() => updateSection(sectionIndex, { questions: section.questions.filter((_, idx) => idx !== questionIndex) })}><DeleteIcon /></IconButton></Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
                <Button sx={{ mt: 2 }} startIcon={<AddIcon />} onClick={() => addQuestion(sectionIndex)}>Add question</Button>
              </Paper>
            ))}

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addSection}>Add section</Button>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} disabled={saving} onClick={saveForm}>Save feedback</Button>
              <Button variant="text" onClick={() => setForm(emptyForm())}>New form</Button>
            </Stack>
          </Stack>
        )}

        {tab === 1 && (
          <Paper sx={{ p: 2, borderRadius: 2, mt: 2 }}>
            {loading && <CircularProgress size={22} />}
            <Box sx={{ height: 520 }}>
              <DataGrid rows={formRows} columns={formColumns} slots={{ toolbar: GridToolbar }} disableRowSelectionOnClick />
            </Box>
          </Paper>
        )}

        {tab === 2 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Feedback form</InputLabel>
                    <Select label="Feedback form" value={analysisForm} onChange={(e) => setAnalysisForm(e.target.value)}>
                      {forms.map((item) => <MenuItem key={item._id} value={item._id}>{item.academicyear} - {item.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Academic year</InputLabel>
                    <Select label="Academic year" value={analysisYear} onChange={(e) => setAnalysisYear(e.target.value)}>
                      {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth variant="contained" startIcon={analysisLoading ? <CircularProgress size={16} color="inherit" /> : null} disabled={analysisLoading} onClick={loadAnalysis}>Load</Button>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button fullWidth variant="outlined" startIcon={sentimentLoading === "__all__" ? <CircularProgress size={16} /> : <AutoFixHighIcon />} disabled={!analysis || sentimentLoading === "__all__"} onClick={analyzeAllSentiment}>
                    Analyze all text responses
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {analysis && (
              <Box className="feedback-analysis-print">
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                    {analysis.institution?.logolink && <Box component="img" src={analysis.institution.logolink} alt="" sx={{ height: 70 }} />}
                    <Box>
                      <Typography variant="h5">{analysis.institution?.institutionname || "Institution"}</Typography>
                      <Typography variant="body2">{analysis.institution?.address}</Typography>
                      <Typography variant="h6" sx={{ mt: 1 }}>{analysis.form?.title}</Typography>
                      <Typography>Total responses: {analysis.totalResponses}</Typography>
                    </Box>
                  </Stack>
                </Paper>
                {overallSentiment && (
                  <Alert severity="info" sx={{ mt: 2, whiteSpace: "pre-line" }}>
                    <Typography fontWeight={800} sx={{ mb: 0.5 }}>Summary of all text responses</Typography>
                    {overallSentiment}
                  </Alert>
                )}
                <Grid container spacing={2} sx={{ mt: 0 }}>
                  {analysis.questions.map((question) => (
                    <Grid item xs={12} md={6} key={question.questionid}>
                      <Card sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={700}>{question.question}</Typography>
                          <Chip sx={{ mt: 1, mb: 2 }} label={`${question.section} | ${question.type}`} />
                          {question.type === "5 Point Scale" ? (
                            <>
                              <Typography variant="h6">Average: {question.average}</Typography>
                              <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={Object.entries(question.scale).map(([rating, count]) => ({ rating, count }))}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="rating" />
                                  <YAxis allowDecimals={false} />
                                  <Tooltip />
                                  <Bar dataKey="count" fill="#2563eb" />
                                </BarChart>
                              </ResponsiveContainer>
                            </>
                          ) : (
                            <Stack spacing={1}>
                              <Button variant="outlined" startIcon={sentimentLoading === question.questionid ? <CircularProgress size={16} /> : <AutoFixHighIcon />} disabled={sentimentLoading === question.questionid} onClick={() => analyzeSentiment(question)}>Analyze sentiment</Button>
                              {question.sentiment && <Alert severity="info">{question.sentiment}</Alert>}
                              {(question.textanswers || []).slice(0, 6).map((answer, index) => <Paper key={index} variant="outlined" sx={{ p: 1 }}>{answer}</Paper>)}
                            </Stack>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Stack>
        )}
      </Container>
    </MenuPageShell>
  );
}

export function FeedbackAdvancedPublicPage() {
  const params = new URLSearchParams(window.location.search);
  const colid = params.get("colid");
  const formid = params.get("formid");
  const [payload, setPayload] = useState(null);
  const [answers, setAnswers] = useState({});
  const [respondent, setRespondent] = useState({ respondentname: "", respondentemail: "", respondentphone: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ep1.get("/api/v2/feedback-advanced/public-form", { params: { colid, formid } });
        setPayload(res.data);
      } catch (error) {
        setMessage(error.response?.data?.message || "Unable to load feedback form");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [colid, formid]);

  const submit = async () => {
    setSubmitting(true);
    try {
      await ep1.post("/api/v2/feedback-advanced/responses", { colid, formid, ...respondent, answers });
      setDone(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  if (message) return <Container maxWidth="md" sx={{ py: 6 }}><Alert severity="error">{message}</Alert></Container>;
  if (done) return <Container maxWidth="md" sx={{ py: 6 }}><Alert severity="success">Thank you. Your feedback has been submitted.</Alert></Container>;

  const { form, institution, accepting } = payload || {};

  return (
    <Box sx={{ minHeight: "100vh", background: "#eef2ff", py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" textAlign={{ xs: "center", md: "left" }}>
            {institution?.logolink && <Box component="img" src={institution.logolink} alt="" sx={{ height: 76, objectFit: "contain" }} />}
            <Box>
              <Typography variant="h5" fontWeight={800}>{institution?.institutionname || "Institution"}</Typography>
              <Typography variant="body2">{institution?.address}</Typography>
            </Box>
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h4" fontWeight={800}>{form?.title}</Typography>
          <Typography color="text.secondary">{form?.description}</Typography>
          <Typography sx={{ mt: 2, whiteSpace: "pre-line" }}>{form?.instructions}</Typography>
          <MediaLinks images={form?.images || []} links={form?.links || []} />
          {!accepting && <Alert severity="warning" sx={{ mt: 2 }}>This feedback form is not accepting responses at this time.</Alert>}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Name" value={respondent.respondentname} onChange={(e) => setRespondent((old) => ({ ...old, respondentname: e.target.value }))} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Email" value={respondent.respondentemail} onChange={(e) => setRespondent((old) => ({ ...old, respondentemail: e.target.value }))} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Phone" value={respondent.respondentphone} onChange={(e) => setRespondent((old) => ({ ...old, respondentphone: e.target.value }))} /></Grid>
          </Grid>

          <Stack spacing={3} sx={{ mt: 3 }}>
            {(form?.sections || []).map((section) => (
              <Paper key={section._id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={800}>{section.title}</Typography>
                <Typography sx={{ whiteSpace: "pre-line" }}>{section.text}</Typography>
                <MediaLinks images={section.images || []} links={section.links || []} />
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {(section.questions || []).map((question) => (
                    <Box key={question._id}>
                      <Typography fontWeight={700}>{question.question}</Typography>
                      <MediaLinks images={question.images || []} links={question.links || []} />
                      {question.type === "5 Point Scale" ? (
                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                          {[1, 2, 3, 4, 5].map((score) => (
                            <Button key={score} variant={answers[question._id] === String(score) ? "contained" : "outlined"} onClick={() => setAnswers((old) => ({ ...old, [question._id]: String(score) }))}>
                              {score}
                            </Button>
                          ))}
                        </Stack>
                      ) : (
                        <TextField fullWidth multiline minRows={3} sx={{ mt: 1 }} value={answers[question._id] || ""} onChange={(e) => setAnswers((old) => ({ ...old, [question._id]: e.target.value }))} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
          <Button sx={{ mt: 3 }} size="large" variant="contained" startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />} disabled={!accepting || submitting} onClick={submit}>Submit feedback</Button>
        </Paper>
      </Container>
    </Box>
  );
}
