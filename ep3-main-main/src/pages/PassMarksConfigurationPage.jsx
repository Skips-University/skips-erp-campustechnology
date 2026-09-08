import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Box,
  Button,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankForm = {
  academicyear: "",
  regulation: "",
  program: "",
  programcode: "",
  course: "",
  coursecode: "",
  component: "Theory",
  maxmarks: "",
  passmarks: "",
  passpercentage: "",
  status: "Active"
};
const fields = Object.keys(blankForm);
const numberFields = ["maxmarks", "passmarks", "passpercentage"];
const labels = {
  academicyear: "Academic Year",
  programcode: "Program Code",
  coursecode: "Course Code",
  maxmarks: "Max Marks",
  passmarks: "Pass Marks",
  passpercentage: "Pass Percentage"
};
const text = (value) => String(value ?? "").trim();

export default function PassMarksConfigurationPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [form, setForm] = useState(blankForm);
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", programcode: "", coursecode: "", component: "" });
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadRows(); }, []);

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/examination-model2/passmarks-configurations", { params });
      setRows(res.data?.data || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load passmarks configuration.");
    } finally {
      setLoading(false);
    }
  };

  const dynamicOptions = useMemo(() => {
    const merged = { ...options };
    fields.forEach((field) => {
      merged[field] = [...new Set([...(merged[field] || []), ...rows.map((row) => row[field])].map(text).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    });
    merged.component = ["Theory", "Practical", "Viva"];
    merged.status = ["Active", "Inactive"];
    return merged;
  }, [options, rows]);

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      await ep1.post("/api/v2/examination-model2/passmarks-configurations", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Passmarks configuration updated." : "Passmarks configuration saved.");
      setEditingId("");
      setForm(blankForm);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save passmarks configuration.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this passmarks configuration?")) return;
    await ep1.post("/api/v2/examination-model2/passmarks-configurations-delete", { id: row._id, colid: global1.colid });
    setMessage("Deleted.");
    await loadRows();
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ ...blankForm, academicyear: "2026-27", regulation: "NEP", program: "B.Com", programcode: "BCOM", course: "Accounting", coursecode: "ACC101", component: "Theory", maxmarks: 100, passmarks: 40, passpercentage: 40 }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pass Marks");
    XLSX.writeFile(wb, "passmarks_configuration_template.xlsx");
  };

  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setSaving(true);
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const fileRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      const res = await ep1.post("/api/v2/examination-model2/passmarks-configurations-bulk", { colid: global1.colid, user: global1.user, rows: fileRows });
      setMessage(`Bulk upload completed. Saved: ${res.data?.saved || 0}`);
      setError((res.data?.errors || []).slice(0, 5).map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload passmarks configuration.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "actions", type: "actions", headerName: "Actions", width: 100, getActions: (params) => [
      <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => { setEditingId(params.row._id); setForm({ ...blankForm, ...params.row }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
      <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove(params.row)} />
    ] },
    ...fields.map((field) => ({ field, headerName: labels[field] || field, width: ["program", "course"].includes(field) ? 190 : 140, type: numberFields.includes(field) ? "number" : "string" }))
  ];

  return (
    <MenuPageShell title="Passmarks Configuration">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={950}>Passmarks Configuration</Typography>
                <Typography color="text.secondary">Configure component wise passing marks and percentage for Exam Model 2 processing.</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadTemplate}>Template</Button>
                <Button variant="contained" component="label" startIcon={<UploadFileIcon />} disabled={saving}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadExcel} /></Button>
              </Stack>
            </Stack>
            {(loading || saving) && <LinearProgress sx={{ mt: 2 }} />}
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              {fields.map((field) => (
                <Grid item xs={12} md={["program", "course"].includes(field) ? 3 : 1.5} key={field}>
                  <TextField
                    fullWidth
                    size="small"
                    select={["component", "status"].includes(field)}
                    type={numberFields.includes(field) ? "number" : "text"}
                    label={labels[field] || field}
                    value={form[field] || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                  >
                    {(["component", "status"].includes(field) ? dynamicOptions[field] : []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                </Grid>
              ))}
              <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" startIcon={<SaveIcon />} onClick={save} disabled={saving}>{editingId ? "Update" : "Save"}</Button><Button variant="outlined" onClick={() => { setEditingId(""); setForm(blankForm); }}>Clear</Button></Stack></Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {Object.keys(filters).map((field) => <Grid item xs={12} md={2} key={field}><TextField select fullWidth size="small" label={`Filter ${labels[field] || field}`} value={filters[field]} onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}><MenuItem value="">All</MenuItem>{(dynamicOptions[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>)}
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={() => loadRows()} disabled={loading} sx={{ height: 40 }}>Apply</Button></Grid>
            </Grid>
            <Box sx={{ height: 580 }}><DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "passmarks_configuration" } } }} pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick /></Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
