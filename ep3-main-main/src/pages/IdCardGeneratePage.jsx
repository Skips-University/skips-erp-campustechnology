import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Add, Delete, FilterAlt, Print, Refresh, Search } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const fieldLabels = {
  academicyear: "Academic Year",
  admissionyear: "Admission Year",
  program: "Program",
  programcode: "Program Code",
  regulation: "Regulation",
  semester: "Semester",
  section: "Section",
  Major: "Major",
  Minor: "Minor",
  IDC: "IDC",
  SEC: "SEC",
  VAC: "VAC",
  category: "Category",
  gender: "Gender",
  department: "Department",
  name: "Name",
  email: "Email",
  phone: "Phone",
  regno: "Reg No"
};

const blankFilter = { field: "academicyear", value: "" };

export default function IdCardGeneratePage() {
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [fields, setFields] = useState(Object.keys(fieldLabels));
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    await Promise.all([loadTemplates(), loadOptions()]);
  };

  const loadTemplates = async () => {
    const res = await ep1.get("/api/v2/id-card/templates", { params: { colid: global1.colid, user: global1.user } });
    const activeTemplates = (res.data?.data || []).filter((item) => item.status !== "Inactive");
    setTemplates(activeTemplates);
    setTemplateId((prev) => prev || activeTemplates[0]?._id || "");
  };

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/id-card/student-options", { params: { colid: global1.colid } });
    setFields(res.data?.fields || Object.keys(fieldLabels));
    setOptions(res.data?.options || {});
  };

  const cleanFilters = () => filters
    .map((filter) => ({ field: filter.field, value: String(filter.value || "").trim() }))
    .filter((filter) => filter.field && filter.value);

  const searchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/id-card/students", { colid: global1.colid, filters: cleanFilters() });
      setStudents(res.data?.data || []);
      setSelectedStudent(null);
      setGeneratedHtml("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to search students");
    } finally {
      setLoading(false);
    }
  };

  const generateCard = async (student = selectedStudent) => {
    if (!templateId) return setError("Select an ID card template.");
    if (!student?._id) return setError("Select a student.");
    setGenerating(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/id-card/generate", { colid: global1.colid, templateid: templateId, studentid: student._id });
      setGeneratedHtml(res.data?.html || "");
      setMessage("ID card generated.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate ID card");
    } finally {
      setGenerating(false);
    }
  };

  const updateFilter = (index, patch) => {
    setFilters((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item));
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...blankFilter }]);
  const removeFilter = (index) => setFilters((prev) => prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index));
  const resetFilters = () => {
    setFilters([{ ...blankFilter }]);
    setStudents([]);
    setSelectedStudent(null);
    setGeneratedHtml("");
  };

  const studentColumns = useMemo(() => [
    { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 140 },
    { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "program", headerName: "Program", minWidth: 180, flex: 1 },
    { field: "programcode", headerName: "Program Code", minWidth: 130 },
    { field: "semester", headerName: "Semester", minWidth: 100 },
    { field: "section", headerName: "Section", minWidth: 100 },
    {
      field: "select",
      headerName: "Select",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => { setSelectedStudent(params.row); generateCard(params.row); }}>
          Select
        </Button>
      )
    }
  ], [templateId]);

  return (
    <MenuPageShell title="Generate ID Card">
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #id-card-print, #id-card-print * { visibility: visible; }
            #id-card-print { position: absolute; left: 0; top: 0; width: 100%; min-height: 100%; display: flex; align-items: flex-start; justify-content: center; padding: 12mm; background: #fff; }
            .no-print { display: none !important; }
            @page { size: A4 portrait; margin: 8mm; }
          }
        `}
      </style>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper className="no-print" elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Generate ID Card</Typography>
              <Typography color="text.secondary">Select a student and HTML template. Matching placeholders are replaced from the user database.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={resetFilters}>Reset</Button>
              <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()} disabled={!generatedHtml}>Print</Button>
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={7} className="no-print">
            <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FilterAlt color="primary" />
                  <Typography variant="h6" fontWeight={800}>Student Filters</Typography>
                </Stack>
                <Button startIcon={<Add />} onClick={addFilter}>Add Filter</Button>
              </Stack>
              <Grid container spacing={2}>
                {filters.map((filter, index) => (
                  <React.Fragment key={`${filter.field}-${index}`}>
                    <Grid item xs={12} md={4}>
                      <TextField select fullWidth label="Field" value={filter.field} onChange={(event) => updateFilter(index, { field: event.target.value })}>
                        {fields.map((field) => <MenuItem key={field} value={field}>{fieldLabels[field] || field}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={7}>
                      <Autocomplete
                        freeSolo
                        options={options[filter.field] || []}
                        value={filter.value || ""}
                        onInputChange={(_, value) => updateFilter(index, { value })}
                        onChange={(_, value) => updateFilter(index, { value: value || "" })}
                        renderInput={(params) => <TextField {...params} label={fieldLabels[filter.field] || filter.field} />}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <Tooltip title="Remove filter">
                        <span>
                          <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1} sx={{ height: 56, width: 56 }}>
                            <Delete />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Grid>
                  </React.Fragment>
                ))}
                <Grid item xs={12} md={8}>
                  <TextField select fullWidth label="ID Card Template" value={templateId} onChange={(e) => { setTemplateId(e.target.value); setGeneratedHtml(""); }}>
                    {templates.map((template) => <MenuItem key={template._id} value={template._id}>{template.templatename}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button fullWidth variant="contained" startIcon={<Search />} onClick={searchStudents} disabled={loading} sx={{ height: 56 }}>
                    {loading ? "Loading..." : "Load Students"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <Box sx={{ height: 440 }}>
                <DataGrid
                  rows={students}
                  columns={studentColumns}
                  getRowId={(row) => row._id}
                  loading={loading}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "id_card_students" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                  disableRowSelectionOnClick
                  onRowClick={(params) => setSelectedStudent(params.row)}
                />
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
                <Button variant="contained" onClick={() => generateCard()} disabled={!selectedStudent || !templateId || generating}>
                  {generating ? "Generating..." : "Generate Selected ID Card"}
                </Button>
                {selectedStudent && <Typography sx={{ alignSelf: "center" }} color="text.secondary">Selected: {selectedStudent.name} ({selectedStudent.regno})</Typography>}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2, minHeight: 620, bgcolor: "#f8fafc" }}>
              <Typography className="no-print" variant="h6" fontWeight={800} sx={{ mb: 2 }}>Preview</Typography>
              <Box id="id-card-print" sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                {generatedHtml ? (
                  <iframe
                    title="ID Card Preview"
                    srcDoc={generatedHtml}
                    style={{ width: 390, height: 610, border: 0, background: "transparent" }}
                  />
                ) : (
                  <Box className="no-print" sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                    Select a student and generate an ID card.
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MenuPageShell>
  );
}
