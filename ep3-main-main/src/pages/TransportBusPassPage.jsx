import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const emptyTemplate = {
  templatename: "",
  description: "",
  html: "",
  orientation: "Landscape",
  status: "Active"
};

const dateOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const defaultFilterFields = ["academicyear", "program", "programcode", "regulation", "semester", "section", "name", "email", "phone", "regno"];

export default function TransportBusPassPage() {
  const navigate = useNavigate();
  const [filterFields, setFilterFields] = useState(defaultFilterFields);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState([{ field: "academicyear", value: "" }]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [passes, setPasses] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [templateForm, setTemplateForm] = useState(emptyTemplate);
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [optionRes, routeRes, templateRes, passRes] = await Promise.all([
        ep1.get("/api/v2/transport-bus-pass/student-options", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/transport-bus-pass/routes", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/transport-bus-pass/templates", { params: { colid: global1.colid, user: global1.user } }),
        ep1.get("/api/v2/transport-bus-pass/passes", { params: { colid: global1.colid } })
      ]);
      setFilterFields(optionRes.data?.fields?.length ? optionRes.data.fields : defaultFilterFields);
      setFilterOptions(optionRes.data?.options || {});
      setRoutes(routeRes.data?.data || []);
      const templateRows = templateRes.data?.data || [];
      setTemplates(templateRows);
      if (!selectedTemplate && templateRows[0]?._id) setSelectedTemplate(templateRows[0]._id);
      setPasses(passRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load bus pass data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const searchStudents = async () => {
    setLoading(true);
    setError("");
    setSelectedStudent(null);
    try {
      const activeFilters = filters.filter((item) => item.field && item.value);
      const res = await ep1.post("/api/v2/transport-bus-pass/students", { colid: global1.colid, filters: activeFilters });
      setStudents(res.data?.data || []);
    } catch (err) {
      setStudents([]);
      setError(err.response?.data?.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  const loadPasses = async () => {
    try {
      const res = await ep1.get("/api/v2/transport-bus-pass/passes", { params: { colid: global1.colid } });
      setPasses(res.data?.data || []);
    } catch {
      setPasses([]);
    }
  };

  const updateFilter = (index, key, value) => {
    setFilters((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item)));
  };

  const addFilter = () => setFilters((prev) => [...prev, { field: "name", value: "" }]);
  const removeFilter = (index) => setFilters((prev) => prev.filter((_, itemIndex) => itemIndex !== index));

  const uploadHtml = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setTemplateForm((prev) => ({ ...prev, html: String(reader.result || "") }));
    reader.readAsText(file);
  };

  const saveTemplate = async () => {
    if (!templateForm.templatename || !templateForm.html) {
      setError("Template name and HTML are required.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/transport-bus-pass/templates", {
        ...templateForm,
        colid: global1.colid,
        user: global1.user,
        isdefault: "No"
      });
      setMessage("Custom bus pass template saved.");
      setTemplateForm(emptyTemplate);
      loadInitial();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save template.");
    } finally {
      setSaving(false);
    }
  };

  const generatePass = async () => {
    if (!selectedStudent?._id || !selectedRoute || !selectedTemplate || !startDate || !endDate) {
      setError("Select student, route, template, start date and end date.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/transport-bus-pass/generate", {
        colid: global1.colid,
        user: global1.user,
        studentid: selectedStudent._id,
        routeid: selectedRoute,
        templateid: selectedTemplate,
        startdate: startDate,
        enddate: endDate
      });
      setPreviewHtml(res.data?.html || "");
      setMessage("Bus pass generated.");
      loadPasses();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate bus pass.");
    } finally {
      setSaving(false);
    }
  };

  const deletePass = async (row) => {
    if (!window.confirm("Delete this bus pass?")) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/transport-bus-pass-delete", { id: row._id, colid: global1.colid });
      setMessage("Bus pass deleted.");
      if (previewHtml === row.html) setPreviewHtml("");
      loadPasses();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete bus pass.");
    } finally {
      setSaving(false);
    }
  };

  const printPreview = () => {
    if (!previewHtml) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Bus Pass</title>
          <style>
            body{margin:0;padding:24px;background:#f8fafc;display:flex;justify-content:center;align-items:flex-start;}
            @media print{body{background:#fff;padding:0;} .pass-wrap{box-shadow:none !important;}}
          </style>
        </head>
        <body><div class="pass-wrap">${previewHtml}</div></body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const selectedTemplateObj = useMemo(() => templates.find((item) => item._id === selectedTemplate), [templates, selectedTemplate]);

  const studentColumns = [
    { field: "name", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg no", minWidth: 140 },
    { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "program", headerName: "Program", minWidth: 170 },
    { field: "semester", headerName: "Semester", minWidth: 110 },
    { field: "section", headerName: "Section", minWidth: 110 }
  ];

  const passColumns = [
    { field: "student", headerName: "Student", minWidth: 170, flex: 1 },
    { field: "regno", headerName: "Reg no", minWidth: 130 },
    { field: "routename", headerName: "Route", minWidth: 170, flex: 1 },
    { field: "routecode", headerName: "Route code", minWidth: 130 },
    { field: "semester", headerName: "Semester", minWidth: 110 },
    { field: "section", headerName: "Section", minWidth: 110 },
    { field: "startdate", headerName: "Start date", minWidth: 130, valueGetter: (params) => dateOnly(params.row.startdate) },
    { field: "enddate", headerName: "End date", minWidth: 130, valueGetter: (params) => dateOnly(params.row.enddate) },
    { field: "templatename", headerName: "Template", minWidth: 170 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<PrintIcon />} label="Preview" onClick={() => setPreviewHtml(params.row.html || "")} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deletePass(params.row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Bus Pass">
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component="button" underline="hover" onClick={() => navigate("/dashdashfacnew")}>Dashboard</Link>
          <Typography color="text.secondary">Transport</Typography>
          <Typography color="text.primary">Bus pass</Typography>
        </Breadcrumbs>

        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Bus pass generator</Typography>
            <Typography color="text.secondary">Select a student, route, validity dates and a template to generate a printable bus pass.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Student search</Typography>
          <Grid container spacing={2}>
            {filters.map((filter, index) => (
              <React.Fragment key={`${filter.field}-${index}`}>
                <Grid item xs={12} md={3}>
                  <TextField select fullWidth label="Field" value={filter.field} onChange={(e) => updateFilter(index, "field", e.target.value)}>
                    {filterFields.map((field) => <MenuItem key={field} value={field}>{field}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select={(filterOptions[filter.field] || []).length > 0}
                    fullWidth
                    label="Value"
                    value={filter.value}
                    onChange={(e) => updateFilter(index, "value", e.target.value)}
                  >
                    {(filterOptions[filter.field] || []).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth variant="outlined" color="error" onClick={() => removeFilter(index)} sx={{ height: 56 }}>Remove</Button>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={addFilter}>Add filter</Button>
                <Button variant="contained" onClick={searchStudents} disabled={loading}>Apply</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
          <DataGrid
            rows={students.map((row) => ({ ...row, id: row._id }))}
            columns={studentColumns}
            loading={loading}
            autoHeight
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            slots={{ toolbar: GridToolbar }}
            onRowClick={(params) => setSelectedStudent(params.row)}
            sx={{
              minWidth: 1150,
              "& .MuiDataGrid-row.Mui-selected": { bgcolor: "#e3f2fd" }
            }}
          />
        </Paper>

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Create bus pass</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Selected student" value={selectedStudent ? `${selectedStudent.name || ""} (${selectedStudent.regno || ""})` : ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Bus route" value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)}>
                {routes.map((route) => (
                  <MenuItem key={route._id} value={route._id}>{route.routecode} - {route.routename}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Template" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                {templates.map((template) => (
                  <MenuItem key={template._id} value={template._id}>{template.templatename}{template.isdefault === "Yes" ? " (Sample)" : ""}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Template type" value={selectedTemplateObj?.isdefault === "Yes" ? "Sample template" : "Custom template"} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="Start date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="End date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} sx={{ height: "100%", alignItems: "center" }}>
                <Button variant="contained" disabled={saving} onClick={generatePass}>Generate bus pass</Button>
                <Button variant="outlined" startIcon={<PrintIcon />} disabled={!previewHtml} onClick={printPreview}>Print preview</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Upload custom HTML template</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use placeholders like {"{{name}}"}, {"{{regno}}"}, {"{{institution}}"}, {"{{logo}}"}, {"{{photo}}"}, {"{{route}}"}, {"{{semester}}"}, {"{{section}}"}, {"{{startdate}}"} and {"{{enddate}}"}.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Template name" value={templateForm.templatename} onChange={(e) => setTemplateForm((prev) => ({ ...prev, templatename: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="Description" value={templateForm.description} onChange={(e) => setTemplateForm((prev) => ({ ...prev, description: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button component="label" fullWidth variant="outlined" startIcon={<UploadFileIcon />} sx={{ height: 56 }}>
                HTML file
                <input hidden type="file" accept=".html,.htm,text/html" onChange={uploadHtml} />
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" disabled={saving} onClick={saveTemplate} sx={{ height: 56 }}>Save template</Button>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={4} label="HTML" value={templateForm.html} onChange={(e) => setTemplateForm((prev) => ({ ...prev, html: e.target.value }))} />
            </Grid>
          </Grid>
        </Paper>

        {previewHtml && (
          <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2, overflowX: "auto" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Bus pass preview</Typography>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={printPreview}>Print</Button>
            </Stack>
            <Box sx={{ display: "flex", justifyContent: "center", p: 2, bgcolor: "#f8fafc" }}>
              <Box dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </Box>
          </Paper>
        )}

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Generated bus passes</Typography>
          <DataGrid
            rows={passes.map((row) => ({ ...row, id: row._id }))}
            columns={passColumns}
            loading={loading}
            autoHeight
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            slots={{ toolbar: GridToolbar }}
            sx={{ minWidth: 1250 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
