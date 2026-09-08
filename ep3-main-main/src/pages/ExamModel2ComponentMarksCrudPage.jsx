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
  exam: "",
  examcode: "",
  regulation: "",
  program: "",
  programcode: "",
  course: "",
  coursecode: "",
  student: "",
  regno: "",
  examrollno: "",
  componenttype: "",
  scoretype: "",
  assessmentgroup: "",
  assessmentgrouptype: "",
  assessmentcomponent: "",
  maxmarks: "",
  marksobtained: "",
  credits: "",
  examinername: "",
  examineremail: ""
};

const fields = Object.keys(blankForm);
const numberFields = ["maxmarks", "marksobtained", "credits"];
const labels = {
  academicyear: "Academic Year",
  examcode: "Exam Code",
  programcode: "Program Code",
  coursecode: "Course Code",
  regno: "Reg No",
  examrollno: "Exam Roll No",
  componenttype: "Component Type",
  scoretype: "Score Type",
  assessmentgroup: "Assessment Group",
  assessmentgrouptype: "Assessment Group Type",
  assessmentcomponent: "Assessment Component",
  maxmarks: "Max Marks",
  marksobtained: "Marks Obtained",
  examinername: "Examiner Name",
  examineremail: "Examiner Email"
};

const text = (value) => String(value ?? "").trim();

export default function ExamModel2ComponentMarksCrudPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ academicyear: "", examcode: "", regulation: "", programcode: "", coursecode: "", regno: "", componenttype: "", assessmentcomponent: "" });
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
      const res = await ep1.get("/api/v2/examination-model2/component-marks", { params });
      setRows(res.data?.data || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load component marks.");
    } finally {
      setLoading(false);
    }
  };

  const dynamicOptions = useMemo(() => {
    const merged = { ...options };
    fields.forEach((field) => {
      merged[field] = [...new Set([...(merged[field] || []), ...rows.map((row) => row[field])].map(text).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    });
    return merged;
  }, [rows, options]);

  const save = async () => {
    if (Number(form.marksobtained || 0) > Number(form.maxmarks || 0)) {
      setError("Marks obtained cannot be more than max marks.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await ep1.post("/api/v2/examination-model2/component-marks", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Component marks updated." : "Component marks saved.");
      setEditingId("");
      setForm(blankForm);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save component marks.");
    } finally {
      setSaving(false);
    }
  };

  const edit = (row) => {
    setEditingId(row._id);
    setForm({ ...blankForm, ...row });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this component marks row?")) return;
    await ep1.post("/api/v2/examination-model2/component-marks-delete", { id: row._id, colid: global1.colid });
    setMessage("Deleted.");
    await loadRows();
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ ...blankForm, academicyear: "2026-27", exam: "Semester Exam", examcode: "SEM1", regulation: "NEP", program: "B.Com", programcode: "BCOM", course: "Accounting", coursecode: "ACC101", student: "Student Name", regno: "REG001", examrollno: "MongoDB examroll _id", componenttype: "Theory", scoretype: "External", assessmentgroup: "End Sem", assessmentgrouptype: "Average", assessmentcomponent: "Theory Paper", maxmarks: 100, marksobtained: 75, credits: 4, examinername: "Examiner", examineremail: "examiner@example.com" }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Component Marks");
    XLSX.writeFile(wb, "exam_model2_component_marks_template.xlsx");
  };

  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setSaving(true);
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const fileRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      const res = await ep1.post("/api/v2/examination-model2/component-marks-bulk", { colid: global1.colid, user: global1.user, rows: fileRows });
      setMessage(`Bulk upload completed. Saved: ${res.data?.saved || 0}`);
      setError((res.data?.errors || []).slice(0, 5).map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload component marks.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "actions", type: "actions", headerName: "Actions", width: 100, getActions: (params) => [<GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => edit(params.row)} />, <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove(params.row)} />] },
    ...fields.map((field) => ({ field, headerName: labels[field] || field, width: ["student", "course", "program", "assessmentcomponent", "examineremail"].includes(field) ? 190 : 140, type: numberFields.includes(field) ? "number" : "string" }))
  ];

  return (
    <MenuPageShell title="Interim Processing">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={950}>Interim Processing</Typography>
                <Typography color="text.secondary">CRUD and bulk upload for componentwise marks before final processing.</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadTemplate}>Template</Button>
                <Button variant="contained" component="label" startIcon={<UploadFileIcon />} disabled={saving}>
                  Bulk Upload
                  <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadExcel} />
                </Button>
              </Stack>
            </Stack>
            {(loading || saving) && <LinearProgress sx={{ mt: 2 }} />}
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              {fields.map((field) => (
                <Grid item xs={12} md={["student", "course", "program", "assessmentcomponent"].includes(field) ? 3 : 1.5} key={field}>
                  <TextField
                    fullWidth
                    size="small"
                    select={["componenttype", "scoretype"].includes(field)}
                    type={numberFields.includes(field) ? "number" : "text"}
                    label={labels[field] || field}
                    value={form[field] || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                  >
                    {field === "componenttype" && ["Theory", "Practical", "Viva"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    {field === "scoretype" && ["Internal", "External"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={save}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</Button>
                  <Button variant="outlined" onClick={() => { setEditingId(""); setForm(blankForm); }}>Clear</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5} sx={{ mb: 1 }}>
              {Object.entries(filters).map(([field, value]) => (
                <Grid item xs={12} md={1.5} key={field}>
                  <TextField select fullWidth size="small" label={labels[field] || field} value={value} onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}>
                    <MenuItem value="">All</MenuItem>
                    {(dynamicOptions[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                </Grid>
              ))}
              <Grid item xs={12} md={1.5}><Button fullWidth variant="contained" sx={{ height: "100%" }} onClick={() => loadRows()}>Apply</Button></Grid>
            </Grid>
            <Box sx={{ height: 640, width: "100%" }}>
              <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_model2_component_marks" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
