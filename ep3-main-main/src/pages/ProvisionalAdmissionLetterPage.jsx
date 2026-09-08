import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ep1 from "../api/ep1";
import global1 from "./global1";

const defaultFields = [
  { field: "admissionyear", label: "Academic Year" },
  { field: "programcode", label: "Program" },
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "phone", label: "Phone" },
  { field: "regno", label: "Reg No" },
  { field: "regulation", label: "Regulation" },
  { field: "Major", label: "Major" },
  { field: "Minor", label: "Minor" },
  { field: "AEC", label: "AEC" },
  { field: "SEC", label: "SEC" },
  { field: "VAC", label: "VAC" },
  { field: "IDC", label: "IDC" },
  { field: "category", label: "Category" },
  { field: "gender", label: "Gender" },
  { field: "semester", label: "Semester" },
  { field: "section", label: "Section" },
  { field: "department", label: "Department" },
  { field: "status1", label: "Status" }
];

const blankFilter = { field: "admissionyear", value: "" };

function money(value) {
  const parsed = Number(value);
  return (Number.isNaN(parsed) ? 0 : parsed).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function todayText() {
  return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProvisionalAdmissionLetterPage() {
  const navigate = useNavigate();
  const colid = useMemo(() => global1.colid, []);
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [fields, setFields] = useState(defaultFields);
  const [options, setOptions] = useState({});
  const [students, setStudents] = useState([]);
  const [selectedRegno, setSelectedRegno] = useState("");
  const [letterData, setLetterData] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [letterLoading, setLetterLoading] = useState(false);
  const [error, setError] = useState("");

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/provisional-admission-letter/options", { params: { colid } });
      setFields(res.data.fields || defaultFields);
      setOptions(res.data.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options");
    }
  };

  const cleanFilters = (source = filters) =>
    source
      .map((filter) => ({ field: filter.field, value: String(filter.value || "").trim() }))
      .filter((filter) => filter.field && filter.value);

  const searchStudents = async (source = filters) => {
    try {
      setLoading(true);
      setError("");
      setLetterData(null);
      const res = await ep1.post("/api/v2/provisional-admission-letter/search", {
        colid,
        filters: cleanFilters(source)
      });
      setStudents(res.data.data || []);
      setSelectedRegno("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to search students");
    } finally {
      setLoading(false);
    }
  };

  const generateLetter = async (regno = selectedRegno) => {
    if (!regno) {
      setError("Please select a student first");
      return;
    }
    try {
      setLetterLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/provisional-admission-letter", { params: { colid, regno } });
      setLetterData(res.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate provisional admission letter");
    } finally {
      setLetterLoading(false);
    }
  };

  useEffect(() => {
    loadInstitution();
    loadOptions();
    searchStudents([{ ...blankFilter, value: "" }]);
  }, []);

  const updateFilter = (index, key, value) => {
    setFilters((prev) =>
      prev.map((filter, itemIndex) => {
        if (itemIndex !== index) return filter;
        const next = { ...filter, [key]: value };
        if (key === "field") next.value = "";
        return next;
      })
    );
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...blankFilter }]);
  const removeFilter = (index) => setFilters((prev) => (prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)));
  const resetFilters = () => {
    const next = [{ ...blankFilter }];
    setFilters(next);
    searchStudents(next);
  };

  const studentColumns = [
    {
      field: "actions",
      headerName: "Letter",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" startIcon={<DescriptionIcon />} onClick={() => { setSelectedRegno(params.row.regno); generateLetter(params.row.regno); }}>
          Generate
        </Button>
      )
    },
    { field: "name", headerName: "Student", width: 190 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "admissionyear", headerName: "Academic Year", width: 140 },
    { field: "programcode", headerName: "Program", width: 130 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "Major", headerName: "Major", width: 160 },
    { field: "Minor", headerName: "Minor", width: 160 },
    { field: "category", headerName: "Category", width: 120 },
    { field: "gender", headerName: "Gender", width: 120 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 130 }
  ];

  const feeColumns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "feegroup", headerName: "Fee Group", width: 160 },
    { field: "feeitem", headerName: "Fee Item", width: 220 },
    { field: "feebook", headerName: "Fee Book", width: 140 },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "paid", headerName: "Paid", width: 110, type: "number" },
    { field: "concession", headerName: "Concession", width: 130, type: "number" },
    { field: "balance", headerName: "Balance", width: 120, type: "number" },
    { field: "status", headerName: "Status", width: 130 }
  ];

  const student = letterData?.student || {};
  const fees = (letterData?.fees || []).map((item) => ({ ...item, id: item._id }));
  const totals = letterData?.totals || {};

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body * { visibility: hidden; }
            #provisional-letter-print, #provisional-letter-print * { visibility: visible; }
            #provisional-letter-print { position: absolute; left: 0; top: 0; width: 190mm; min-height: 277mm; background: white; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Generate Provisional Admission Letter</Typography>
          <Typography variant="body2" color="text.secondary">Search students dynamically and print provisional admission letters with fee structure.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!letterData}>Print Letter</Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        </Stack>
      </Stack>

      {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
          <Typography variant="h6">Dynamic Filters</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addFilter}>Add Filter</Button>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={() => searchStudents()}>Search</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={resetFilters}>Reset</Button>
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          {filters.map((filter, index) => (
            <Grid container spacing={1.5} alignItems="center" key={`${filter.field}-${index}`}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Field</InputLabel>
                  <Select label="Field" value={filter.field} onChange={(event) => updateFilter(index, "field", event.target.value)}>
                    {fields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={7}>
                <Autocomplete
                  freeSolo
                  options={options[filter.field]?.values || []}
                  value={filter.value || ""}
                  onInputChange={(_, value) => updateFilter(index, "value", value)}
                  onChange={(_, value) => updateFilter(index, "value", value || "")}
                  renderInput={(params) => <TextField {...params} size="small" label="Value" />}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Tooltip title="Remove filter">
                  <span>
                    <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1 && !filter.value}>
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          ))}
        </Stack>
      </Paper>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1 }}>
          <Typography variant="h6">Students</Typography>
          <Chip label={`${students.length} students`} />
        </Stack>
        <DataGrid
          rows={students.map((row) => ({ ...row, id: row._id }))}
          columns={studentColumns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "provisional_admission_students" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          onRowClick={(params) => setSelectedRegno(params.row.regno)}
          sx={{ minWidth: 1700 }}
        />
      </Paper>

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <Autocomplete
            fullWidth
            options={students}
            value={students.find((item) => item.regno === selectedRegno) || null}
            getOptionLabel={(option) => option ? `${option.name || ""} - ${option.regno || ""} - ${option.programcode || ""}` : ""}
            onChange={(_, value) => setSelectedRegno(value?.regno || "")}
            renderInput={(params) => <TextField {...params} label="Selected Student" />}
          />
          <Button variant="contained" startIcon={<DescriptionIcon />} onClick={() => generateLetter()} disabled={!selectedRegno || letterLoading} sx={{ minWidth: 220 }}>
            Generate Letter
          </Button>
        </Stack>
      </Paper>

      {letterData && (
        <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
          <Typography variant="h6" sx={{ px: 1, py: 1 }}>Fee Structure</Typography>
          <DataGrid
            rows={fees}
            columns={feeColumns}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "provisional_admission_fee_structure" } } }}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1250 }}
          />
        </Paper>
      )}

      <Box id="provisional-letter-print" sx={{ bgcolor: "white", color: "#111827", maxWidth: "210mm", mx: "auto", p: 4, border: "1px solid #d1d5db", minHeight: "277mm", "@media print": { p: 0 } }}>
        {letterData ? (
          <>
            <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2 }}>
              {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 72, height: 72, objectFit: "contain" }} />}
              <Typography variant="h6" fontWeight={800}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
              <Typography variant="body2" sx={{ maxWidth: 680 }}>{institution?.address || ""}</Typography>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 1 }}>Provisional Admission Letter</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="body2"><b>Ref:</b> PAL/{student.regno}</Typography>
              <Typography variant="body2"><b>Date:</b> {todayText()}</Typography>
            </Stack>

            <Typography variant="body2" sx={{ mb: 1 }}>To,</Typography>
            <Typography variant="body2" fontWeight={700}>{student.name}</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>{student.address || "Address not available"}</Typography>

            <Typography variant="body2" sx={{ mb: 1.5 }}>Dear {student.name},</Typography>
            <Typography variant="body2" sx={{ mb: 1.5, textAlign: "justify", lineHeight: 1.7 }}>
              We are pleased to inform you that you have been provisionally admitted to the program shown below, subject to verification of original documents,
              fulfillment of eligibility conditions, payment of applicable fees, and compliance with the rules and regulations of the institution.
            </Typography>

            <Grid container spacing={1} sx={{ borderTop: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", py: 1, mb: 2 }}>
              <Grid item xs={6}><Typography variant="body2"><b>Reg No:</b> {student.regno}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><b>Academic Year:</b> {student.admissionyear}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><b>Program:</b> {student.programcode}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><b>Regulation:</b> {student.regulation}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><b>Major:</b> {student.Major}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><b>Minor:</b> {student.Minor}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><b>Category:</b> {student.category}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><b>Gender:</b> {student.gender}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><b>Email:</b> {student.email}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><b>Phone:</b> {student.phone}</Typography></Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Fee Structure</Typography>
            <Grid container sx={{ border: "1px solid #cbd5e1", borderBottom: 0, fontSize: 12 }}>
              {["Fee Group", "Fee Item", "Amount", "Paid", "Concession", "Balance"].map((head, index) => (
                <Grid item xs={index === 0 ? 2 : index === 1 ? 4 : 1.5} key={head} sx={{ bgcolor: "#eef3f7", borderRight: index === 5 ? 0 : "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, fontWeight: 800, textAlign: index < 2 ? "left" : "right" }}>
                  {head}
                </Grid>
              ))}
              {fees.map((item) => (
                <React.Fragment key={item._id}>
                  <Grid item xs={2} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75 }}>{item.feegroup}</Grid>
                  <Grid item xs={4} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75 }}>{item.feeitem}</Grid>
                  <Grid item xs={1.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right" }}>{money(item.amount)}</Grid>
                  <Grid item xs={1.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right" }}>{money(item.paid)}</Grid>
                  <Grid item xs={1.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right" }}>{money(item.concession)}</Grid>
                  <Grid item xs={1.5} sx={{ borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right" }}>{money(item.balance)}</Grid>
                </React.Fragment>
              ))}
              <Grid item xs={6} sx={{ bgcolor: "#eef3f7", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, fontWeight: 800 }}>Total</Grid>
              <Grid item xs={1.5} sx={{ bgcolor: "#eef3f7", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right", fontWeight: 800 }}>{money(totals.amount)}</Grid>
              <Grid item xs={1.5} sx={{ bgcolor: "#eef3f7", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right", fontWeight: 800 }}>{money(totals.paid)}</Grid>
              <Grid item xs={1.5} sx={{ bgcolor: "#eef3f7", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right", fontWeight: 800 }}>{money(totals.concession)}</Grid>
              <Grid item xs={1.5} sx={{ bgcolor: "#eef3f7", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right", fontWeight: 800 }}>{money(totals.balance)}</Grid>
            </Grid>

            <Typography variant="body2" sx={{ mt: 2, textAlign: "justify", lineHeight: 1.7 }}>
              This letter is issued provisionally and does not constitute final confirmation of admission until all statutory, academic, and financial requirements
              are completed. The institution reserves the right to cancel the admission if any submitted information is found incorrect or eligibility conditions are not met.
            </Typography>

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 8 }}>
              <Box sx={{ width: "38%", borderTop: "1px solid #111827", pt: 1, textAlign: "center", fontWeight: 700 }}>Checked by</Box>
              <Box sx={{ width: "38%", borderTop: "1px solid #111827", pt: 1, textAlign: "center", fontWeight: 700 }}>Authorized Signatory</Box>
            </Stack>
          </>
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 360, textAlign: "center" }}>
            <DescriptionIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            <Typography variant="h6">Select a student and generate the provisional admission letter</Typography>
          </Stack>
        )}
      </Box>
    </Container>
  );
}
