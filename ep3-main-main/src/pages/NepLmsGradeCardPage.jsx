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
import { ArrowBack, Print, Refresh, Search, Verified } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import QRCode from "qrcode";
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

export default function NepLmsGradeCardPage() {
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState(blankFilters);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [semester, setSemester] = useState("");
  const [institution, setInstitution] = useState(null);
  const [gradeCard, setGradeCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blockchainSaving, setBlockchainSaving] = useState(false);
  const [verificationQr, setVerificationQr] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
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
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
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
  };

  const generateGradeCard = async () => {
    if (!selectedStudent?.regno) {
      setError("Please select a student");
      return;
    }
    if (!semester) {
      setError("Please select semester");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/grade-card", {
        params: { colid: global1.colid, regno: selectedStudent.regno, semester }
      });
      setGradeCard(res.data || null);
      setMessage("Grade card generated");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate grade card");
    } finally {
      setLoading(false);
    }
  };

  const storeGradeCardBlockchain = async () => {
    if (!gradeCard || !activeStudent?.regno || !semester) {
      setError("Generate a grade card before storing in blockchain");
      return;
    }
    try {
      setBlockchainSaving(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/grade-card/blockchain-store", {
        colid: global1.colid,
        regno: activeStudent.regno,
        semester,
        user: global1.user
      });
      setMessage(`${res.data?.message || "Stored in blockchain"}. Hash: ${res.data?.data?.hash || ""}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to store grade card in blockchain");
    } finally {
      setBlockchainSaving(false);
    }
  };

  const studentColumns = [
    { field: "name", headerName: "Student", width: 190 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "rollno", headerName: "Roll No", width: 110 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "admissionyear", headerName: "Admission Year", width: 140 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "section", headerName: "Section", width: 110 },
    { field: "Major", headerName: "Major", width: 160 },
    { field: "Minor", headerName: "Minor", width: 160 }
  ];

  const markColumns = [
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "course", headerName: "Course", flex: 1, minWidth: 220 },
    { field: "internalmarks", headerName: "Internal", width: 110, type: "number" },
    { field: "externalmarks", headerName: "External", width: 110, type: "number" },
    { field: "total", headerName: "Total", width: 100, type: "number" },
    { field: "credits", headerName: "Credits", width: 100, type: "number" },
    { field: "grade", headerName: "Grade", width: 90 },
    { field: "gradepoint", headerName: "Grade Point", width: 120, type: "number" },
    { field: "gpa", headerName: "GPA", width: 100, type: "number" },
    { field: "passstatus", headerName: "Status", width: 110 }
  ];

  const activeStudent = gradeCard?.student || selectedStudent || {};
  const verificationLink = useMemo(() => {
    if (!gradeCard || !activeStudent?.regno) return "";
    const base = `${window.location.origin}/verify-grade-card-blockchain`;
    const params = new URLSearchParams({
      student: activeStudent.name || "",
      regno: activeStudent.regno || ""
    });
    return `${base}?${params.toString()}`;
  }, [gradeCard, activeStudent.name, activeStudent.regno]);

  useEffect(() => {
    let alive = true;
    const createQr = async () => {
      if (!verificationLink) {
        setVerificationQr("");
        return;
      }
      try {
        const dataUrl = await QRCode.toDataURL(verificationLink, {
          width: 170,
          margin: 1,
          color: { dark: "#111827", light: "#ffffff" }
        });
        if (alive) setVerificationQr(dataUrl);
      } catch (err) {
        if (alive) setVerificationQr("");
      }
    };
    createQr();
    return () => {
      alive = false;
    };
  }, [verificationLink]);

  const semesterOptions = useMemo(() => {
    const base = options.semesters || [];
    return [...new Set([...base, selectedStudent?.semester, semester].filter(Boolean))]
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  }, [options.semesters, selectedStudent, semester]);

  const renderFilter = (definition) => (
    <Grid item xs={12} md={3} key={definition.field}>
      {definition.text ? (
        <TextField
          fullWidth
          size="small"
          label={definition.label}
          value={filters[definition.field]}
          onChange={(event) => setFilters((prev) => ({ ...prev, [definition.field]: event.target.value }))}
        />
      ) : (
        <FormControl fullWidth size="small">
          <InputLabel>{definition.label}</InputLabel>
          <Select
            label={definition.label}
            value={filters[definition.field]}
            onChange={(event) => setFilters((prev) => ({ ...prev, [definition.field]: event.target.value }))}
          >
            <MenuItem value="">All</MenuItem>
            {(options[definition.optionKey] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </Select>
        </FormControl>
      )}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .grade-card-print, .grade-card-print * { visibility: visible; }
            .grade-card-print { position: absolute; left: 0; top: 0; width: 100%; padding: 12mm; }
            .no-print { display: none !important; }
          }
        `}
      </style>
      <Stack className="no-print" direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Generate Grade Card</Typography>
          <Typography variant="body2" color="text.secondary">Search a student, select semester, and generate printable SGPA/CGPA grade card.</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
      </Stack>

      {message && <Alert className="no-print" severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          {filterDefinitions.map(renderFilter)}
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          <Button variant="contained" startIcon={<Search />} onClick={searchStudents} disabled={loading}>Search Students</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => { setFilters(blankFilters); setStudents([]); setSelectedStudent(null); setGradeCard(null); }}>Clear</Button>
        </Stack>
      </Paper>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={students}
          getRowId={(row) => row._id}
          columns={studentColumns}
          loading={loading}
          autoHeight
          onRowClick={(params) => selectStudent(params.row)}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "grade_card_students" } } }}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1550 }}
        />
      </Paper>

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField fullWidth label="Selected Student" value={selectedStudent ? `${selectedStudent.name || ""} - ${selectedStudent.regno || ""}` : ""} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select label="Semester" value={semester} onChange={(event) => setSemester(event.target.value)}>
                {semesterOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" onClick={generateGradeCard} disabled={loading}>Generate</Button>
              <Button fullWidth variant="contained" color="success" startIcon={<Verified />} onClick={storeGradeCardBlockchain} disabled={!gradeCard || blockchainSaving}>
                {blockchainSaving ? "Storing..." : "Store Blockchain"}
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Print />} onClick={() => window.print()} disabled={!gradeCard}>Print</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {gradeCard && (
        <Paper className="grade-card-print" sx={{ p: 3, maxWidth: 980, mx: "auto" }}>
          <Stack alignItems="center" spacing={0.5} sx={{ mb: 2, textAlign: "center" }}>
            {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ maxHeight: 80, objectFit: "contain" }} />}
            <Typography variant="h5" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
            <Typography variant="body2">{institution?.address || ""}</Typography>
            <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>Grade Card</Typography>
          </Stack>

          <Grid container spacing={1.2} sx={{ mb: 2 }}>
            {[
              ["Student", activeStudent.name],
              ["Reg No", activeStudent.regno],
              ["Roll No", activeStudent.rollno],
              ["Academic Year", activeStudent.academicyear],
              ["Admission Year", activeStudent.admissionyear],
              ["Program", activeStudent.program],
              ["Program Code", activeStudent.programcode],
              ["Semester", semester],
              ["Section", activeStudent.section],
              ["Major", activeStudent.Major],
              ["Minor", activeStudent.Minor],
              ["Regulation", activeStudent.regulation]
            ].map(([label, value]) => (
              <Grid item xs={6} md={3} key={label}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="body2" fontWeight={700}>{value || "-"}</Typography>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ mb: 2 }} />
          <Box sx={{ width: "100%", overflowX: "auto", mb: 2 }}>
            <DataGrid
              rows={gradeCard.marks || []}
              getRowId={(row) => row._id}
              columns={markColumns}
              autoHeight
              hideFooter
              disableColumnMenu
              sx={{ minWidth: 920, "& .MuiDataGrid-columnHeaders": { bgcolor: "#eef3f8", fontWeight: 800 } }}
            />
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="flex-end" sx={{ mb: 5 }}>
            <Chip color="primary" label={`Semester Credits: ${gradeCard.sgpa?.totalCredits || 0}`} />
            <Chip color="success" label={`SGPA: ${gradeCard.sgpa?.value || 0}`} />
            <Chip color="secondary" label={`CGPA till date: ${gradeCard.cgpa?.value || 0}`} />
          </Stack>

          {verificationLink && (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mb: 3,
                display: "flex",
                gap: 2,
                alignItems: "center",
                justifyContent: "space-between",
                borderColor: "#cbd5e1",
                bgcolor: "#f8fafc",
                breakInside: "avoid"
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={900}>Blockchain Verification</Typography>
                <Typography variant="caption" color="text.secondary">Scan the QR code or use this link to verify the marksheet.</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5, overflowWrap: "anywhere" }}>
                  {verificationLink}
                </Typography>
              </Box>
              {verificationQr && (
                <Box
                  component="img"
                  src={verificationQr}
                  alt="Blockchain verification QR code"
                  sx={{ width: 110, height: 110, border: "1px solid #e2e8f0", bgcolor: "#fff", p: 0.5 }}
                />
              )}
            </Paper>
          )}

          <Grid container spacing={4} sx={{ mt: 4, textAlign: "center" }}>
            <Grid item xs={4}><Typography variant="body2" sx={{ borderTop: "1px solid #333", pt: 1 }}>Prepared By</Typography></Grid>
            <Grid item xs={4}><Typography variant="body2" sx={{ borderTop: "1px solid #333", pt: 1 }}>Checked By</Typography></Grid>
            <Grid item xs={4}><Typography variant="body2" sx={{ borderTop: "1px solid #333", pt: 1 }}>Approved By</Typography></Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
