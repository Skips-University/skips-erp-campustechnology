import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
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
import { ArrowBack, AutoAwesome, Print, Refresh, Search, Verified } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import QRCode from "qrcode";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterDefinitions = [
  { field: "academicyear", label: "Academic Year", optionKey: "academicyears" },
  { field: "admissionyear", label: "Admission Year", optionKey: "admissionyears" },
  { field: "program", label: "Program", optionKey: "programs" },
  { field: "programcode", label: "Program Code", optionKey: "programcodes" },
  { field: "semester", label: "Semester", optionKey: "semesters" },
  { field: "section", label: "Section", optionKey: "sections" },
  { field: "major", label: "Major", optionKey: "majors" },
  { field: "minor", label: "Minor", optionKey: "minors" },
  { field: "name", label: "Name", text: true },
  { field: "email", label: "Email", text: true },
  { field: "phone", label: "Phone", text: true },
  { field: "regno", label: "Reg No", text: true }
];

const blankFilters = filterDefinitions.reduce((acc, item) => ({ ...acc, [item.field]: "" }), {});
const yes = (value) => String(value || "").toLowerCase() === "yes";
const fmt = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function NepLmsAdvancedGradeCardPage() {
  const [options, setOptions] = useState({});
  const [aiOptions, setAiOptions] = useState({});
  const [filters, setFilters] = useState(blankFilters);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [semester, setSemester] = useState("");
  const [institution, setInstitution] = useState(null);
  const [gradeCard, setGradeCard] = useState(null);
  const [provider, setProvider] = useState("Gemini");
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
  const [ollamaId, setOllamaId] = useState("");
  const [formatRules, setFormatRules] = useState("Use a clean official A4 marksheet layout. Keep tables compact and include attendance, backlog, QR verification and signature areas.");
  const [formattedHtml, setFormattedHtml] = useState("");
  const [blockchainSaving, setBlockchainSaving] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const [blockchainLink, setBlockchainLink] = useState("");
  const [verificationQr, setVerificationQr] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadAiOptions();
    loadInstitution();
  }, []);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/neplms/grade-card/options", { params: { colid: global1.colid } });
      setOptions(res.data || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options");
    }
  };

  const loadAiOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/neplms/advanced-grade-card/ai-options", { params: { colid: global1.colid } });
      setAiOptions(res.data || {});
      if (res.data?.geminiModels?.[0]) setGeminiModel(res.data.geminiModels[0]);
      const defaultOllama = (res.data?.ollama || []).find((item) => /^yes$/i.test(item.default)) || (res.data?.ollama || [])[0];
      if (defaultOllama?._id) setOllamaId(defaultOllama._id);
    } catch (err) {
      setAiOptions({});
    }
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get(`/vins?colid=${global1.colid}`);
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const searchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      setGradeCard(null);
      setFormattedHtml("");
      setBlockchainLink("");
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/neplms/grade-card/students", { params });
      setStudents(res.data?.data || []);
      setMessage(`Loaded ${res.data?.data?.length || 0} students`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to search students");
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setSemester(student.semester || "");
    setGradeCard(null);
    setFormattedHtml("");
    setBlockchainLink("");
  };

  const generateGradeCard = async () => {
    if (!selectedStudent?.regno) return setError("Please select a student");
    if (!semester) return setError("Please select semester");
    try {
      setLoading(true);
      setError("");
      setFormattedHtml("");
      setBlockchainLink("");
      const res = await ep1.get("/api/v2/neplms/advanced-grade-card", {
        params: { colid: global1.colid, regno: selectedStudent.regno, semester }
      });
      setGradeCard(res.data || null);
      setMessage("Advanced grade card generated");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate advanced grade card");
    } finally {
      setLoading(false);
    }
  };

  const formatWithAi = async () => {
    if (!gradeCard?.student?.regno) return setError("Generate grade card before AI formatting");
    try {
      setFormatting(true);
      setError("");
      const res = await ep1.post("/api/v2/neplms/advanced-grade-card/format", {
        colid: global1.colid,
        provider,
        geminiModel,
        ollamaId,
        rules: formatRules,
        gradecard: gradeCard
      });
      setFormattedHtml(res.data.html || "");
      setMessage("Grade card formatted with AI");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to format grade card with AI");
    } finally {
      setFormatting(false);
    }
  };

  const storeBlockchain = async () => {
    if (!gradeCard?.student?.regno) return setError("Generate grade card before storing in blockchain");
    try {
      setBlockchainSaving(true);
      setError("");
      const res = await ep1.post("/api/v2/neplms/advanced-grade-card/blockchain-store", {
        colid: global1.colid,
        regno: gradeCard.student.regno,
        semester,
        user: global1.user,
        origin: window.location.origin,
        gradecard: { ...gradeCard, formattedHtml },
        formattedHtml
      });
      const link = res.data?.data?.verificationurl || verificationLink(res.data?.data?.hash);
      setBlockchainLink(link);
      setMessage(`${res.data?.message || "Stored in blockchain"}. Hash: ${res.data?.data?.hash || ""}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to store advanced grade card in blockchain");
    } finally {
      setBlockchainSaving(false);
    }
  };

  const activeStudent = gradeCard?.student || selectedStudent || {};
  const config = gradeCard?.marksheetconfiguration || {};
  const verificationLink = (hash = "") => {
    if (!activeStudent?.regno) return "";
    const params = new URLSearchParams({ student: activeStudent.name || "", regno: activeStudent.regno || "", colid: String(global1.colid || "") });
    if (hash) params.set("hash", hash);
    return `${window.location.origin}/verify-grade-card-blockchain?${params.toString()}`;
  };
  const printableLink = blockchainLink || verificationLink();

  useEffect(() => {
    let alive = true;
    const createQr = async () => {
      if (!printableLink) {
        setVerificationQr("");
        return;
      }
      try {
        const dataUrl = await QRCode.toDataURL(printableLink, { width: 170, margin: 1, color: { dark: "#111827", light: "#ffffff" } });
        if (alive) setVerificationQr(dataUrl);
      } catch (err) {
        if (alive) setVerificationQr("");
      }
    };
    createQr();
    return () => { alive = false; };
  }, [printableLink]);

  const studentColumns = [
    { field: "name", headerName: "Student", width: 190 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "rollno", headerName: "Roll No", width: 110 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "section", headerName: "Section", width: 110 },
    { field: "Major", headerName: "Major", width: 160 },
    { field: "Minor", headerName: "Minor", width: 160 }
  ];

  const markColumns = useMemo(() => [
    yes(config.coursecode) && { field: "coursecode", headerName: "Course Code", width: 130 },
    yes(config.course) && { field: "course", headerName: "Course", flex: 1, minWidth: 220 },
    yes(config.internal) && { field: "internalmarks", headerName: "Internal", width: 110, type: "number" },
    yes(config.external) && { field: "externalmarks", headerName: "External", width: 110, type: "number" },
    yes(config.total) && { field: "total", headerName: "Total", width: 100, type: "number" },
    yes(config.credits) && { field: "credits", headerName: "Credits", width: 100, type: "number" },
    yes(config.grade) && { field: "grade", headerName: "Grade", width: 90 },
    { field: "gradepoint", headerName: "Grade Point", width: 120, type: "number" },
    { field: "gpa", headerName: "GPA", width: 100, type: "number" },
    yes(config.backlogindicator) && { field: "passstatus", headerName: "Status", width: 110 }
  ].filter(Boolean), [config]);

  const attendanceColumns = [
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "course", headerName: "Course", flex: 1, minWidth: 220 },
    { field: "totalclasses", headerName: "Classes", width: 110, type: "number" },
    { field: "present", headerName: "Present", width: 110, type: "number" },
    { field: "absent", headerName: "Absent", width: 110, type: "number" },
    { field: "percentage", headerName: "Attendance %", width: 140, type: "number" }
  ];

  const backlogColumns = [
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "course", headerName: "Course", flex: 1, minWidth: 220 },
    { field: "total", headerName: "Total", width: 100, type: "number" },
    { field: "grade", headerName: "Grade", width: 90 },
    { field: "passstatus", headerName: "Status", width: 110 }
  ];

  const semesterOptions = useMemo(() => [...new Set([...(options.semesters || []), selectedStudent?.semester, semester].filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })), [options.semesters, selectedStudent, semester]);

  const renderFilter = (definition) => (
    <Grid item xs={12} md={3} key={definition.field}>
      {definition.text ? (
        <TextField fullWidth size="small" label={definition.label} value={filters[definition.field]} onChange={(event) => setFilters((prev) => ({ ...prev, [definition.field]: event.target.value }))} />
      ) : (
        <FormControl fullWidth size="small">
          <InputLabel>{definition.label}</InputLabel>
          <Select label={definition.label} value={filters[definition.field]} onChange={(event) => setFilters((prev) => ({ ...prev, [definition.field]: event.target.value }))}>
            <MenuItem value="">All</MenuItem>
            {(options[definition.optionKey] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </Select>
        </FormControl>
      )}
    </Grid>
  );

  const qrPositionSx = {
    position: "absolute",
    width: 110,
    height: 110,
    top: config.qrcodeposition === "topright" ? 18 : "auto",
    right: config.qrcodeposition === "topright" || config.qrcodeposition === "bottomright" ? 18 : "50%",
    bottom: config.qrcodeposition === "bottomright" || config.qrcodeposition === "bottomcenter" ? 18 : "auto",
    transform: config.qrcodeposition === "bottomcenter" ? "translateX(50%)" : "none",
    border: "1px solid #e2e8f0",
    bgcolor: "#fff",
    p: 0.5
  };

  const programDisplay = () => {
    if (config.programnamedisplay === "programcode") return activeStudent.programcode || "-";
    if (config.programnamedisplay === "abbreviation") return activeStudent.programcode || activeStudent.program || "-";
    return `${activeStudent.program || "-"}${activeStudent.programcode ? ` (${activeStudent.programcode})` : ""}`;
  };

  return (
    <MenuPageShell title="Advanced Grade Card">
      <Box sx={{ p: 3 }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .advanced-grade-card-print, .advanced-grade-card-print * { visibility: visible; }
            .advanced-grade-card-print { position: absolute; left: 0; top: 0; width: 100%; padding: 8mm; }
            .no-print { display: none !important; }
          }
        `}</style>
        <Stack className="no-print" direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Advanced Grade Card</Typography>
            <Typography variant="body2" color="text.secondary">Generate marksheet with attendance, backlog, AI formatting and blockchain verification.</Typography>
          </Box>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>

        {message && <Alert className="no-print" severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>{filterDefinitions.map(renderFilter)}</Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
            <Button variant="contained" startIcon={<Search />} onClick={searchStudents} disabled={loading}>Search Students</Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => { setFilters(blankFilters); setStudents([]); setSelectedStudent(null); setGradeCard(null); setFormattedHtml(""); }}>Clear</Button>
          </Stack>
        </Paper>

        <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
          <DataGrid rows={students} getRowId={(row) => row._id} columns={studentColumns} loading={loading} autoHeight onRowClick={(params) => selectStudent(params.row)} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "advanced_grade_card_students" } } }} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} sx={{ minWidth: 1400 }} />
        </Paper>

        <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}><TextField fullWidth label="Selected Student" value={selectedStudent ? `${selectedStudent.name || ""} - ${selectedStudent.regno || ""}` : ""} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Semester</InputLabel><Select label="Semester" value={semester} onChange={(event) => setSemester(event.target.value)}>{semesterOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button variant="contained" onClick={generateGradeCard} disabled={loading}>Generate</Button>
                <Button variant="contained" color="success" startIcon={<Verified />} onClick={storeBlockchain} disabled={!gradeCard || blockchainSaving}>{blockchainSaving ? "Storing..." : "Store Blockchain"}</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()} disabled={!gradeCard}>Print</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="AI Provider" value={provider} onChange={(e) => setProvider(e.target.value)}><MenuItem value="Gemini">Gemini</MenuItem><MenuItem value="Ollama">Ollama</MenuItem></TextField></Grid>
            {provider === "Gemini" ? (
              <Grid item xs={12} md={3}><TextField select fullWidth label="Gemini Model" value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)}>{(aiOptions.geminiModels || []).map((model) => <MenuItem key={model} value={model}>{model}</MenuItem>)}</TextField></Grid>
            ) : (
              <Grid item xs={12} md={3}><TextField select fullWidth label="Ollama Config" value={ollamaId} onChange={(e) => setOllamaId(e.target.value)}>{(aiOptions.ollama || []).map((item) => <MenuItem key={item._id} value={item._id}>{item.name} ({item.modelname})</MenuItem>)}</TextField></Grid>
            )}
            <Grid item xs={12} md={5}><TextField fullWidth multiline minRows={2} label="Formatting Rules" value={formatRules} onChange={(e) => setFormatRules(e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><Button fullWidth sx={{ height: "100%" }} variant="contained" startIcon={<AutoAwesome />} onClick={formatWithAi} disabled={!gradeCard || formatting}>{formatting ? "Formatting..." : "Format"}</Button></Grid>
          </Grid>
        </Paper>

        {gradeCard && (
          <Paper className="advanced-grade-card-print" sx={{ p: 3, maxWidth: 980, mx: "auto", position: "relative", overflow: "hidden" }}>
            {config.watermark && <Typography sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76, fontWeight: 900, color: "rgba(15,23,42,0.06)", transform: "rotate(-28deg)", pointerEvents: "none" }}>{config.watermark}</Typography>}
            {formattedHtml ? (
              <Box dangerouslySetInnerHTML={{ __html: formattedHtml }} />
            ) : (
              <>
                <Stack alignItems="center" spacing={0.5} sx={{ mb: 2, textAlign: "center", position: "relative", zIndex: 1 }}>
                  {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ maxHeight: 78, objectFit: "contain" }} />}
                  <Typography variant="h5" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
                  <Typography variant="body2">{institution?.address || ""}</Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>Advanced Grade Card</Typography>
                </Stack>
                <Grid container spacing={1.2} sx={{ mb: 2, position: "relative", zIndex: 1 }}>
                  {[["Student", activeStudent.name], ["Reg No", activeStudent.regno], ["Roll No", activeStudent.rollno], ["Academic Year", activeStudent.academicyear], ["Admission Year", activeStudent.admissionyear], ["Program", programDisplay()], ["Semester", semester], ["Section", activeStudent.section], ["Major", activeStudent.Major], ["Minor", activeStudent.Minor], ["Regulation", activeStudent.regulation]].map(([label, value]) => (
                    <Grid item xs={6} md={3} key={label}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="body2" fontWeight={700}>{value || "-"}</Typography></Grid>
                  ))}
                </Grid>
                <Divider sx={{ mb: 2 }} />
                <DataGrid rows={gradeCard.marks || []} getRowId={(row) => row._id} columns={markColumns} autoHeight hideFooter disableColumnMenu sx={{ mb: 2, minWidth: 880, "& .MuiDataGrid-columnHeaders": { bgcolor: "#eef3f8", fontWeight: 800 } }} />
                {yes(config.attendance) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Attendance</Typography>
                    <DataGrid rows={(gradeCard.attendance || []).map((row, index) => ({ ...row, id: `${row.coursecode}-${index}` }))} columns={attendanceColumns} autoHeight hideFooter disableColumnMenu sx={{ minWidth: 780 }} />
                  </Box>
                )}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Backlog Information</Typography>
                  {(gradeCard.backlog || []).length ? (
                    <DataGrid rows={(gradeCard.backlog || []).map((row, index) => ({ ...row, id: `${row.coursecode}-${row.semester}-${index}` }))} columns={backlogColumns} autoHeight hideFooter disableColumnMenu sx={{ minWidth: 780 }} />
                  ) : (
                    <Typography variant="body2" sx={{ p: 1.5, border: "1px solid #dbe3ef", borderRadius: 1 }}>No backlog found.</Typography>
                  )}
                </Box>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="flex-end" sx={{ mb: 4 }}>
                  <Chip color="primary" label={`Semester Credits: ${fmt(gradeCard.sgpa?.totalCredits)}`} />
                  <Chip color="success" label={`SGPA: ${fmt(gradeCard.sgpa?.value)}`} />
                  <Chip color="secondary" label={`CGPA till date: ${fmt(gradeCard.cgpa?.value)}`} />
                </Stack>
                {yes(config.signature) && <Grid container spacing={4} sx={{ mt: 4, textAlign: "center" }}><Grid item xs={4}><Typography variant="body2" sx={{ borderTop: "1px solid #333", pt: 1 }}>Prepared By</Typography></Grid><Grid item xs={4}><Typography variant="body2" sx={{ borderTop: "1px solid #333", pt: 1 }}>Checked By</Typography></Grid><Grid item xs={4}><Typography variant="body2" sx={{ borderTop: "1px solid #333", pt: 1 }}>Approved By</Typography></Grid></Grid>}
              </>
            )}
            {printableLink && (
              <Box sx={{ mt: formattedHtml ? 2 : 1 }}>
                <Typography variant="caption" sx={{ overflowWrap: "anywhere", display: "block", pr: 14 }}>Blockchain verification: {printableLink}</Typography>
                {verificationQr && <Box component="img" src={verificationQr} alt="Blockchain verification QR" sx={qrPositionSx} />}
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </MenuPageShell>
  );
}
