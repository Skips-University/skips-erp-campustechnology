import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Cancel, Delete, Edit, Print, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "regulation", label: "Regulation" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "course", label: "Course" },
  { field: "coursecode", label: "Course Code" },
  { field: "student", label: "Student" },
  { field: "regno", label: "Reg No" },
  { field: "contenttype", label: "Content Type" },
  { field: "topic", label: "Topic" }
];

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const editableFields = ["academicyear", "regulation", "program", "programcode", "course", "coursecode", "topic", "student", "regno", "contenttype", "title", "description", "link", "provider", "marks", "maxmarks", "percentage", "status"];
const blankEditForm = editableFields.reduce((acc, field) => ({ ...acc, [field]: "" }), {});

export default function NepLmsRemedialPage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([{ field: "academicyear", value: "" }]);
  const [institution, setInstitution] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editForm, setEditForm] = useState(blankEditForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRows();
    loadInstitution();
  }, []);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.get("/api/v2/neplms/remedial", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load remedial content");
    } finally {
      setLoading(false);
    }
  };

  const activeFilters = useMemo(() => filters.filter((item) => item.field && item.value), [filters]);
  const filteredRows = useMemo(() => rows.filter((row) => activeFilters.every((filter) => String(row[filter.field] || "") === String(filter.value || ""))), [rows, activeFilters]);
  const optionValues = useMemo(() => filterFields.reduce((acc, item) => ({ ...acc, [item.field]: uniqueSorted(rows.map((row) => row[item.field])) }), {}), [rows]);

  const updateFilter = (index, patch) => setFilters((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item));
  const addFilter = () => {
    const used = new Set(filters.map((item) => item.field));
    const field = filterFields.find((item) => !used.has(item.field))?.field || filterFields[0].field;
    setFilters((prev) => [...prev, { field, value: "" }]);
  };

  const openEdit = (row) => {
    setEditId(row._id);
    setEditForm(editableFields.reduce((acc, field) => ({ ...acc, [field]: row[field] ?? "" }), {}));
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      setError("");
      setMessage("");
      await ep1.post("/api/v2/neplms/remedial/update", {
        id: editId,
        colid: global1.colid,
        user: global1.user,
        ...editForm
      });
      setMessage("Remedial record updated");
      setEditOpen(false);
      setEditId("");
      setEditForm(blankEditForm);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update remedial record");
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this remedial record?")) return;
    try {
      setError("");
      setMessage("");
      await ep1.post("/api/v2/neplms/remedial/delete", { id: row._id, colid: global1.colid });
      setMessage("Remedial record deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete remedial record");
    }
  };

  const columns = [
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => openEdit(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "program", headerName: "Program", width: 190 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "course", headerName: "Course", width: 190 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "student", headerName: "Student", width: 190 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "contenttype", headerName: "Type", width: 140 },
    { field: "topic", headerName: "Topic", width: 220 },
    { field: "percentage", headerName: "Score %", width: 100 },
    {
      field: "link",
      headerName: "Link",
      width: 240,
      renderCell: (params) => params.value ? <a href={params.value} target="_blank" rel="noreferrer">Open</a> : ""
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body * { visibility: hidden; }
            #remedial-print, #remedial-print * { visibility: visible; }
            #remedial-print { position: absolute; left: 0; top: 0; width: 190mm; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>
      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Remedial</Typography>
          <Typography variant="body2" color="text.secondary">View remedial videos and course material generated from assessment scores.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
        </Stack>
      </Stack>
      {error && <Alert severity="error" className="no-print" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" className="no-print" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Dynamic Filters</Typography>
          <Button startIcon={<Add />} onClick={addFilter}>Add Filter</Button>
        </Stack>
        <Grid container spacing={2}>
          {filters.map((filter, index) => (
            <React.Fragment key={`${filter.field}-${index}`}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Field</InputLabel>
                  <Select label="Field" value={filter.field} onChange={(event) => updateFilter(index, { field: event.target.value })}>
                    {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth size="small">
                  <InputLabel>Value</InputLabel>
                  <Select label="Value" value={filter.value} onChange={(event) => updateFilter(index, { value: event.target.value })}>
                    <MenuItem value="">All</MenuItem>
                    {(optionValues[filter.field] || []).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1}>
                <IconButton color="error" disabled={filters.length === 1} onClick={() => setFilters((prev) => prev.filter((_, i) => i !== index))}><Cancel /></IconButton>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </Paper>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={filteredRows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "remedial" } } }}
          sx={{ minWidth: 1900 }}
        />
      </Paper>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Remedial Record</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {editableFields.map((field) => (
              <Grid item xs={12} md={field === "description" || field === "link" ? 12 : 4} key={field}>
                {field === "contenttype" || field === "status" ? (
                  <FormControl fullWidth size="small">
                    <InputLabel>{field}</InputLabel>
                    <Select label={field} value={editForm[field]} onChange={(event) => setEditForm((prev) => ({ ...prev, [field]: event.target.value }))}>
                      {(field === "contenttype" ? ["Video", "Course Material"] : ["Active", "Inactive"]).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    type={["marks", "maxmarks", "percentage"].includes(field) ? "number" : "text"}
                    label={field}
                    value={editForm[field]}
                    multiline={field === "description" || field === "link"}
                    minRows={field === "description" ? 2 : 1}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, [field]: event.target.value }))}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Paper id="remedial-print" sx={{ maxWidth: "210mm", mx: "auto", p: 3, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 70, height: 70, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Remedial Content Report</Typography>
        </Stack>
        <Typography variant="body2" sx={{ mb: 1 }}><strong>Total Records:</strong> {filteredRows.length}</Typography>
        <Box sx={{ border: "1px solid #cbd5e1" }}>
          <Grid container sx={{ bgcolor: "#e2e8f0" }}>
            {["Student", "Reg No", "Course", "Topic", "Type", "Link"].map((heading) => (
              <Grid item xs={heading === "Student" || heading === "Course" ? 2 : heading === "Topic" || heading === "Link" ? 3 : 1} key={heading} sx={{ p: 0.75, borderRight: "1px solid #cbd5e1" }}>
                <Typography variant="caption" fontWeight={900}>{heading}</Typography>
              </Grid>
            ))}
          </Grid>
          {filteredRows.map((row) => (
            <Grid container key={row._id} sx={{ borderTop: "1px solid #e5e7eb" }}>
              <Grid item xs={2} sx={{ p: 0.75 }}><Typography variant="caption">{row.student || "-"}</Typography></Grid>
              <Grid item xs={1} sx={{ p: 0.75 }}><Typography variant="caption">{row.regno || "-"}</Typography></Grid>
              <Grid item xs={2} sx={{ p: 0.75 }}><Typography variant="caption">{row.coursecode || row.course || "-"}</Typography></Grid>
              <Grid item xs={3} sx={{ p: 0.75 }}><Typography variant="caption">{row.topic || "-"}</Typography></Grid>
              <Grid item xs={1} sx={{ p: 0.75 }}><Typography variant="caption">{row.contenttype || "-"}</Typography></Grid>
              <Grid item xs={3} sx={{ p: 0.75 }}><Typography variant="caption" sx={{ wordBreak: "break-all" }}>{row.link || "-"}</Typography></Grid>
            </Grid>
          ))}
        </Box>
      </Paper>
    </Container>
  );
}
