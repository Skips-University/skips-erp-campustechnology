import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  LinearProgress
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankFilters = {
  academicyear: "",
  program: "",
  programcode: "",
  regulation: "",
  type: "",
  subject: "",
  semester: ""
};

const languageFallback = [
  "English",
  "Hindi",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Urdu",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Odia",
  "Punjabi",
  "Assamese",
  "Maithili",
  "Santali",
  "Kashmiri",
  "Nepali",
  "Konkani",
  "Sindhi",
  "Dogri",
  "Manipuri",
  "Bodo",
  "Sanskrit"
];

const uniq = (items) => Array.from(new Set(items.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));

export default function NepLmsAiCourseGenerationPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(blankFilters);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [resources, setResources] = useState([]);
  const [languages, setLanguages] = useState(languageFallback);
  const [language, setLanguage] = useState("English");
  const [providers, setProviders] = useState(["ChatGPT", "Gemini"]);
  const [provider, setProvider] = useState("Gemini");
  const [ollamaConfigs, setOllamaConfigs] = useState([]);
  const [ollamaConfigId, setOllamaConfigId] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedCourse = useMemo(
    () => courses.find((item) => item._id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const filteredCourses = useMemo(() => courses.filter((item) => (
    (!filters.academicyear || item.academicyear === filters.academicyear)
    && (!filters.program || item.program === filters.program)
    && (!filters.programcode || item.programcode === filters.programcode)
    && (!filters.regulation || item.regulation === filters.regulation)
    && (!filters.type || item.type === filters.type)
    && (!filters.subject || item.subject === filters.subject)
    && (!filters.semester || item.semester === filters.semester)
  )), [courses, filters]);

  const optionValues = useMemo(() => ({
    academicyears: uniq(courses.map((item) => item.academicyear)),
    programs: uniq(courses.map((item) => item.program)),
    programcodes: uniq(courses.map((item) => item.programcode)),
    regulations: uniq(courses.map((item) => item.regulation)),
    types: uniq(courses.map((item) => item.type)),
    subjects: uniq(courses.map((item) => item.subject)),
    semesters: uniq(courses.map((item) => item.semester))
  }), [courses]);

  useEffect(() => {
    loadContext();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadModulesForCourse(selectedCourse);
      loadCourseMaterials(selectedCourse);
      setTitle(`AI Course Material - ${selectedCourse.course}`);
    } else {
      setModules([]);
      setSelectedModuleIds([]);
      setResources([]);
    }
  }, [selectedCourseId]);

  const contextParams = (extra = {}) => ({
    colid: global1.colid,
    facultyemail: global1.user,
    ...filters,
    ...extra
  });

  const loadContext = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/ai-course-generation/context", { params: contextParams() });
      const nextCourses = res.data?.courses || [];
      setCourses(nextCourses);
      setLanguages(res.data?.languages?.length ? res.data.languages : languageFallback);
      const activeProviders = res.data?.providers?.length ? res.data.providers : ["ChatGPT", "Gemini"];
      const activeOllamaConfigs = res.data?.ollamaConfigs || [];
      setProviders(activeProviders);
      setOllamaConfigs(activeOllamaConfigs);
      if (!activeProviders.includes(provider)) setProvider(activeProviders[0] || "Gemini");
      if (activeOllamaConfigs.length && !activeOllamaConfigs.some((item) => item._id === ollamaConfigId)) {
        setOllamaConfigId(activeOllamaConfigs[0]._id);
      }
      if (selectedCourseId && !nextCourses.some((item) => item._id === selectedCourseId)) {
        setSelectedCourseId("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assigned courses");
    } finally {
      setLoading(false);
    }
  };

  const loadModulesForCourse = async (course) => {
    try {
      const res = await ep1.get("/api/v2/neplms/ai-course-generation/context", {
        params: contextParams({
          academicyear: course.academicyear,
          regulation: course.regulation,
          program: course.program,
          programcode: course.programcode,
          type: course.type,
          subject: course.subject,
          semester: course.semester,
          course: course.course,
          coursecode: course.coursecode
        })
      });
      const nextModules = res.data?.modules || [];
      setModules(nextModules);
      setSelectedModuleIds(nextModules.map((item) => item._id));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load modules");
    }
  };

  const loadCourseMaterials = async (course) => {
    try {
      const res = await ep1.get("/api/v2/neplms/resources", {
        params: {
          colid: global1.colid,
          academicyear: course.academicyear,
          semester: course.semester,
          coursecode: course.coursecode,
          resourcetype: "Course Material"
        }
      });
      setResources(res.data?.data || []);
    } catch (err) {
      setResources([]);
    }
  };

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setSelectedCourseId("");
  };

  const clearFilters = () => {
    setFilters(blankFilters);
    setSelectedCourseId("");
    setTimeout(loadContext, 0);
  };

  const generateMaterial = async () => {
    if (!selectedCourse) {
      setError("Please select a course.");
      return;
    }
    if (!selectedModuleIds.length) {
      setError("Please select at least one module.");
      return;
    }
    if (provider === "Ollama" && !ollamaConfigId) {
      setError("Please select an Ollama configuration.");
      return;
    }
    try {
      setGenerating(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/ai-course-generation/generate", {
        ...selectedCourse,
        colid: global1.colid,
        user: global1.user,
        facultyemail: global1.user,
        faculty: global1.name,
        moduleids: selectedModuleIds,
        language,
        provider,
        ollamaConfigId,
        title
      });
      setMessage(`Course material created. Link: ${res.data?.url || ""}`);
      await loadCourseMaterials(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate course material");
    } finally {
      setGenerating(false);
    }
  };

  const filterSelect = (field, label, options) => (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={filters[field]}
      onChange={(event) => updateFilter(field, event.target.value)}
    >
      <MenuItem value="">All</MenuItem>
      {options.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
    </TextField>
  );

  const columns = [
    { field: "title", headerName: "Title", minWidth: 240, flex: 1 },
    { field: "module", headerName: "Modules", minWidth: 220 },
    { field: "topic", headerName: "Topic", minWidth: 220 },
    { field: "description", headerName: "Description", minWidth: 320 },
    {
      field: "url",
      headerName: "Link",
      minWidth: 260,
      renderCell: (params) => params.value ? (
        <a href={params.value} target="_blank" rel="noreferrer">Open material</a>
      ) : ""
    },
    { field: "createdAt", headerName: "Created", minWidth: 170, valueGetter: (value) => value ? new Date(value).toLocaleString() : "" }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>AI Course Generation</Typography>
          <Typography variant="body2" color="text.secondary">
            Generate course material for assigned courses and save it directly under NEP LMS course material.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadContext} disabled={loading}>Refresh</Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>Assigned Course Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>{filterSelect("academicyear", "Academic year", optionValues.academicyears)}</Grid>
          <Grid item xs={12} md={2}>{filterSelect("program", "Program", optionValues.programs)}</Grid>
          <Grid item xs={12} md={2}>{filterSelect("programcode", "Program code", optionValues.programcodes)}</Grid>
          <Grid item xs={12} md={2}>{filterSelect("regulation", "Regulation", optionValues.regulations)}</Grid>
          <Grid item xs={12} md={1.5}>{filterSelect("type", "Type", optionValues.types)}</Grid>
          <Grid item xs={12} md={1.5}>{filterSelect("subject", "Subject", optionValues.subjects)}</Grid>
          <Grid item xs={12} md={1}>{filterSelect("semester", "Semester", optionValues.semesters)}</Grid>
          <Grid item xs={12} md={1}>
            <Button fullWidth variant="outlined" onClick={clearFilters} sx={{ height: 40 }}>Clear</Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Assigned course"
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
            >
              {filteredCourses.map((item) => (
                <MenuItem key={item._id} value={item._id}>
                  {item.coursecode} - {item.course} | {item.programcode} | Sem {item.semester}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth disabled={!selectedCourse}>
              <InputLabel id="modules-label">Modules</InputLabel>
              <Select
                labelId="modules-label"
                label="Modules"
                multiple
                value={selectedModuleIds}
                onChange={(event) => setSelectedModuleIds(typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value)}
                renderValue={(selected) => modules.filter((item) => selected.includes(item._id)).map((item) => item.module).join(", ")}
              >
                {modules.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    <Checkbox checked={selectedModuleIds.includes(item._id)} />
                    <ListItemText primary={item.module} secondary={item.syllabus} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Language" value={language} onChange={(event) => setLanguage(event.target.value)}>
              {languages.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="AI provider" value={provider} onChange={(event) => setProvider(event.target.value)}>
              {providers.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          {provider === "Ollama" && (
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Ollama configuration"
                value={ollamaConfigId}
                onChange={(event) => setOllamaConfigId(event.target.value)}
              >
                {ollamaConfigs.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.name} - {item.modelname} ({item.serveraddress || "http://localhost:11434"})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Material title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              disabled={generating || !selectedCourse || !selectedModuleIds.length}
              onClick={generateMaterial}
              sx={{ height: 56 }}
            >
              {generating ? "Generating..." : "Generate and upload"}
            </Button>
          </Grid>
          {generating && (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Existing Course Material</Typography>
        <DataGrid
          rows={resources}
          getRowId={(row) => row._id}
          columns={columns}
          autoHeight
          loading={loading || generating}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "ai_course_material" } } }}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1200 }}
        />
      </Paper>

      <Button component={RouterLink} to="/neplmscourseworkspace" variant="outlined">
        Open course workspace
      </Button>
    </Container>
  );
}
