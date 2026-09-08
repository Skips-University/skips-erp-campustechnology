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

const emptyTemplate = { templatename: "", description: "", html: "", orientation: "Landscape", status: "Active" };
const defaultFilters = ["buildingname", "roomno", "student", "studentemail", "studentphone", "programcode", "regno", "status"];

export default function HostelCardPage() {
  const navigate = useNavigate();
  const [filterFields, setFilterFields] = useState(defaultFilters);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState([{ field: "student", value: "" }]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateForm, setTemplateForm] = useState(emptyTemplate);
  const [cards, setCards] = useState([]);
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [optionRes, templateRes, cardRes] = await Promise.all([
        ep1.get("/api/v2/hostel-card/assignment-options", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/hostel-card/templates", { params: { colid: global1.colid, user: global1.user } }),
        ep1.get("/api/v2/hostel-card/cards", { params: { colid: global1.colid } })
      ]);
      setFilterFields(optionRes.data?.fields?.length ? optionRes.data.fields : defaultFilters);
      setFilterOptions(optionRes.data?.options || {});
      const templateRows = templateRes.data?.data || [];
      setTemplates(templateRows);
      if (!selectedTemplate && templateRows[0]?._id) setSelectedTemplate(templateRows[0]._id);
      setCards(cardRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load hostel card data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const searchAssignments = async () => {
    setLoading(true);
    setError("");
    setSelectedAssignment(null);
    try {
      const activeFilters = filters.filter((item) => item.field && item.value);
      const res = await ep1.post("/api/v2/hostel-card/assignments", { colid: global1.colid, filters: activeFilters });
      setAssignments(res.data?.data || []);
    } catch (err) {
      setAssignments([]);
      setError(err.response?.data?.message || "Unable to load hostel assignments.");
    } finally {
      setLoading(false);
    }
  };

  const loadCards = async () => {
    try {
      const res = await ep1.get("/api/v2/hostel-card/cards", { params: { colid: global1.colid } });
      setCards(res.data?.data || []);
    } catch {
      setCards([]);
    }
  };

  const updateFilter = (index, key, value) => {
    setFilters((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item)));
  };

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
      await ep1.post("/api/v2/hostel-card/templates", {
        ...templateForm,
        colid: global1.colid,
        user: global1.user,
        isdefault: "No"
      });
      setMessage("Custom hostel card template saved.");
      setTemplateForm(emptyTemplate);
      loadInitial();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save template.");
    } finally {
      setSaving(false);
    }
  };

  const generateCard = async () => {
    if (!selectedAssignment?._id || !selectedTemplate) {
      setError("Select hostel assignment and template.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/hostel-card/generate", {
        colid: global1.colid,
        user: global1.user,
        assignmentid: selectedAssignment._id,
        templateid: selectedTemplate
      });
      setPreviewHtml(res.data?.html || "");
      setMessage("Hostel card generated.");
      loadCards();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate hostel card.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCard = async (row) => {
    if (!window.confirm("Delete this hostel card?")) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/hostel-card-delete", { id: row._id, colid: global1.colid });
      setMessage("Hostel card deleted.");
      if (previewHtml === row.html) setPreviewHtml("");
      loadCards();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete hostel card.");
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
          <title>Hostel Card</title>
          <style>
            body{margin:0;padding:24px;background:#f8fafc;display:flex;justify-content:center;align-items:flex-start;}
            @media print{body{background:#fff;padding:0;} .card-wrap{box-shadow:none !important;}}
          </style>
        </head>
        <body><div class="card-wrap">${previewHtml}</div></body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const selectedTemplateObj = useMemo(() => templates.find((item) => item._id === selectedTemplate), [templates, selectedTemplate]);

  const assignmentColumns = [
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg no", minWidth: 130 },
    { field: "studentemail", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "studentphone", headerName: "Phone", minWidth: 130 },
    { field: "buildingname", headerName: "Building", minWidth: 170 },
    { field: "block", headerName: "Block", minWidth: 90 },
    { field: "floor", headerName: "Floor", minWidth: 90 },
    { field: "roomno", headerName: "Room", minWidth: 100 },
    { field: "bedno", headerName: "Bed", minWidth: 80 },
    { field: "programcode", headerName: "Program", minWidth: 130 },
    { field: "status", headerName: "Status", minWidth: 110 }
  ];

  const cardColumns = [
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg no", minWidth: 130 },
    { field: "buildingname", headerName: "Building", minWidth: 170 },
    { field: "block", headerName: "Block", minWidth: 90 },
    { field: "floor", headerName: "Floor", minWidth: 90 },
    { field: "roomno", headerName: "Room", minWidth: 100 },
    { field: "bedno", headerName: "Bed", minWidth: 80 },
    { field: "templatename", headerName: "Template", minWidth: 170 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<PrintIcon />} label="Preview" onClick={() => setPreviewHtml(params.row.html || "")} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteCard(params.row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Hostel Card">
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component="button" underline="hover" onClick={() => navigate("/dashdashfacnew")}>Dashboard</Link>
          <Typography color="text.secondary">Hostel Mapping</Typography>
          <Typography color="text.primary">Hostel Card</Typography>
        </Breadcrumbs>

        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Hostel card generator</Typography>
            <Typography color="text.secondary">Select a hostel assignment and generate a printable resident card using sample or uploaded HTML templates.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Dynamic filters</Typography>
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
                  <Button fullWidth variant="outlined" color="error" onClick={() => setFilters((prev) => prev.length === 1 ? [{ field: "student", value: "" }] : prev.filter((_, itemIndex) => itemIndex !== index))} sx={{ height: 56 }}>Remove</Button>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => setFilters((prev) => [...prev, { field: "student", value: "" }])}>Add filter</Button>
                <Button variant="contained" onClick={searchAssignments} disabled={loading}>Apply</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
          <DataGrid
            rows={assignments.map((row) => ({ ...row, id: row._id }))}
            columns={assignmentColumns}
            loading={loading}
            autoHeight
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            slots={{ toolbar: GridToolbar }}
            onRowClick={(params) => setSelectedAssignment(params.row)}
            sx={{ minWidth: 1300 }}
          />
        </Paper>

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Generate card</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Selected student" value={selectedAssignment ? `${selectedAssignment.student || ""} (${selectedAssignment.regno || ""})` : ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Selected room" value={selectedAssignment ? `${selectedAssignment.buildingname || ""}, Room ${selectedAssignment.roomno || ""}, Bed ${selectedAssignment.bedno || ""}` : ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Template" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                {templates.map((template) => <MenuItem key={template._id} value={template._id}>{template.templatename}{template.isdefault === "Yes" ? " (Sample)" : ""}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField fullWidth label="Type" value={selectedTemplateObj?.isdefault === "Yes" ? "Sample" : "Custom"} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" disabled={saving} onClick={generateCard}>Generate hostel card</Button>
                <Button variant="outlined" startIcon={<PrintIcon />} disabled={!previewHtml} onClick={printPreview}>Print preview</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Upload custom HTML template</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use placeholders like {"{{student}}"}, {"{{regno}}"}, {"{{institution}}"}, {"{{logo}}"}, {"{{photo}}"}, {"{{buildingname}}"}, {"{{block}}"}, {"{{floor}}"}, {"{{roomno}}"} and {"{{bedno}}"}.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField fullWidth label="Template name" value={templateForm.templatename} onChange={(e) => setTemplateForm((prev) => ({ ...prev, templatename: e.target.value }))} /></Grid>
            <Grid item xs={12} md={5}><TextField fullWidth label="Description" value={templateForm.description} onChange={(e) => setTemplateForm((prev) => ({ ...prev, description: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}>
              <Button component="label" fullWidth variant="outlined" startIcon={<UploadFileIcon />} sx={{ height: 56 }}>
                HTML file
                <input hidden type="file" accept=".html,.htm,text/html" onChange={uploadHtml} />
              </Button>
            </Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={saving} onClick={saveTemplate} sx={{ height: 56 }}>Save template</Button></Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={4} label="HTML" value={templateForm.html} onChange={(e) => setTemplateForm((prev) => ({ ...prev, html: e.target.value }))} /></Grid>
          </Grid>
        </Paper>

        {previewHtml && (
          <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2, overflowX: "auto" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Hostel card preview</Typography>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={printPreview}>Print</Button>
            </Stack>
            <Box sx={{ display: "flex", justifyContent: "center", p: 2, bgcolor: "#f8fafc" }}>
              <Box dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </Box>
          </Paper>
        )}

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Generated hostel cards</Typography>
          <DataGrid
            rows={cards.map((row) => ({ ...row, id: row._id }))}
            columns={cardColumns}
            loading={loading}
            autoHeight
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            slots={{ toolbar: GridToolbar }}
            sx={{ minWidth: 1200 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
