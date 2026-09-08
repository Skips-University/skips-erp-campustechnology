import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ep1 from "../api/ep1";
import global1 from "./global1";
import PlacementCoordinatorShell from "./PlacementCoordinatorShell";

const emptyForm = { id: "", title: "", type: "", level: "", helptext: "" };

const excelRows = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
};

const downloadTemplate = () => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{
    title: "Admission process",
    type: "Admission",
    level: "UG",
    helptext: "Students can apply online. Keep email, phone and marksheets ready."
  }]), "Knowledgebase");
  XLSX.writeFile(workbook, "knowledgebase_template.xlsx");
};

export default function KnowledgebasePage() {
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ type: "", level: "", search: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const shareLink = useMemo(() => {
    const base = `${window.location.origin}/ai-helpdesk-chatbot`;
    const params = new URLSearchParams({
      colid: global1.colid || "",
      type: form.type || filters.type || "",
      level: form.level || filters.level || ""
    });
    return `${base}?${params.toString()}`;
  }, [form.type, form.level, filters.type, filters.level]);

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async (override = filters) => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/knowledgebase", { params: { colid: global1.colid, ...override } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load knowledgebase");
    } finally {
      setLoading(false);
    }
  };

  const saveRow = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/knowledgebase", { ...form, colid: global1.colid, user: global1.user });
      setMessage(form.id ? "Knowledgebase updated" : "Knowledgebase saved");
      setForm(emptyForm);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save knowledgebase");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setForm({
      id: row._id,
      title: row.title || "",
      type: row.type || "",
      level: row.level || "",
      helptext: row.helptext || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this knowledgebase entry?")) return;
    try {
      await ep1.post("/api/v2/knowledgebase-delete", { id: row._id, colid: global1.colid });
      setMessage("Knowledgebase deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete knowledgebase");
    }
  };

  const uploadRows = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      setError("");
      const items = await excelRows(file);
      const res = await ep1.post("/api/v2/knowledgebase-bulk", { colid: global1.colid, user: global1.user, items });
      setMessage(`${res.data?.saved || 0} knowledgebase entries uploaded`);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload knowledgebase");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setMessage("Share link copied");
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editRow(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    },
    { field: "title", headerName: "Title", minWidth: 220, flex: 1 },
    { field: "type", headerName: "Type", minWidth: 150 },
    { field: "level", headerName: "Level", minWidth: 140 },
    { field: "helptext", headerName: "Help Text", minWidth: 360, flex: 2 }
  ];

  return (
    <PlacementCoordinatorShell title="Knowledgebase">
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Knowledgebase</Typography>
            <Typography variant="body2" color="text.secondary">Create help content used by the public AI Helpdesk chatbot.</Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton onClick={() => loadRows()}><RefreshIcon /></IconButton>
          </Tooltip>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth label="Level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" sx={{ height: 56 }} onClick={saveRow} disabled={saving}>{form.id ? "Update" : "Save"}</Button>
              <Button variant="outlined" sx={{ height: 56 }} onClick={() => setForm(emptyForm)}>Clear</Button>
            </Stack>
          </Grid>
          <Grid item xs={12}><TextField fullWidth multiline minRows={5} label="Help Text" value={form.helptext} onChange={(e) => setForm({ ...form, helptext: e.target.value })} /></Grid>

          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc" }}>
              <Typography variant="subtitle2" fontWeight={900}>Share chatbot link</Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
                <TextField fullWidth value={shareLink} InputProps={{ readOnly: true }} />
                <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyLink}>Copy</Button>
                <Button variant="outlined" component={Link} href={shareLink} target="_blank">Open</Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}><TextField fullWidth label="Filter Type" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Filter Level" value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></Grid>
          <Grid item xs={12} md={3}><Button fullWidth variant="outlined" sx={{ height: 56 }} onClick={() => loadRows()}>Apply Filter</Button></Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="outlined" onClick={downloadTemplate}>Download Template</Button>
              <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                Bulk Upload
                <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadRows} />
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ height: 560, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "knowledgebase" } } }}
                disableRowSelectionOnClick
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </PlacementCoordinatorShell>
  );
}
