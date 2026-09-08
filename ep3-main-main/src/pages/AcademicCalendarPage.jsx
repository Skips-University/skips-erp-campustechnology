import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const years = Array.from({ length: 10 }, (_, index) => `${2023 + index}-${String(24 + index).padStart(2, "0")}`);
const types = ["Holiday", "Working day"];
const emptyForm = {
  academicyear: "2026-27",
  regulation: "",
  program: "",
  programcode: "",
  semester: "",
  ativity: "",
  description: "",
  activitydate: "",
  type: "Working day",
  level: "",
  status1: "Active",
  comments: ""
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

export default function AcademicCalendarPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [regulationSubjectRows, setRegulationSubjectRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
    loadRegulationSubjects();
  }, []);

  const uniqueSorted = (values) => Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const loadRegulationSubjects = async () => {
    try {
      const res = await ep1.get("/api/v2/regulationsubject", { params: { colid: global1.colid } });
      setRegulationSubjectRows(res.data?.data || []);
    } catch (err) {
      setRegulationSubjectRows([]);
    }
  };

  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/academiccalendar", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load academic calendar.");
    } finally {
      setLoading(false);
    }
  };

  const setField = (field, value) => {
    setForm((prev) => {
      if (field === "academicyear") return { ...prev, academicyear: value, regulation: "", program: "", programcode: "" };
      if (field === "regulation") return { ...prev, regulation: value, program: "", programcode: "" };
      if (field === "program") {
        const match = regulationSubjectRows.find((item) => (
          item.academicyear === prev.academicyear &&
          item.regulation === prev.regulation &&
          item.program === value
        ));
        return { ...prev, program: value, programcode: match?.programcode || "" };
      }
      return { ...prev, [field]: value };
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId("");
  };

  const saveRow = async () => {
    if (!form.academicyear || !form.ativity || !form.activitydate) {
      setError("Academic year, activity and activity date are required.");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        id: editId,
        colid: global1.colid,
        user: global1.user,
        name: global1.name || global1.user
      };
      await ep1.post(editId ? "/api/v2/academiccalendar/update" : "/api/v2/academiccalendar", payload);
      setMessage(editId ? "Academic calendar entry updated." : "Academic calendar entry added.");
      resetForm();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save academic calendar entry.");
    } finally {
      setActionLoading(false);
    }
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({
      academicyear: row.academicyear || "2026-27",
      regulation: row.regulation || "",
      program: row.program || "",
      programcode: row.programcode || "",
      semester: row.semester || "",
      ativity: row.ativity || "",
      description: row.description || "",
      activitydate: formatDate(row.activitydate),
      type: row.type || "Working day",
      level: row.level || "",
      status1: row.status1 || "Active",
      comments: row.comments || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this academic calendar entry?")) return;
    setActionLoading(true);
    setError("");
    try {
      await ep1.post("/api/v2/academiccalendar/delete", { id: row._id, colid: global1.colid });
      setMessage("Academic calendar entry deleted.");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete academic calendar entry.");
    } finally {
      setActionLoading(false);
    }
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        academicyear: "2026-27",
        regulation: "NEP 2026",
        program: "B.Com",
        programcode: "BCOM",
        semester: "1",
        activity: "Induction",
        description: "Student induction programme",
        activitydate: "2026-07-01",
        type: "Working day",
        level: "UG",
        status1: "Active",
        comments: ""
      },
      {
        academicyear: "2026-27",
        regulation: "",
        program: "",
        programcode: "",
        semester: "",
        activity: "Independence Day",
        description: "Holiday",
        activitydate: "2026-08-15",
        type: "Holiday",
        level: "",
        status1: "Active",
        comments: ""
      }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Academic Calendar");
    XLSX.writeFile(workbook, "academic_calendar_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setActionLoading(true);
    setError("");
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const uploadRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const res = await ep1.post("/api/v2/academiccalendar/bulk", {
        colid: global1.colid,
        user: global1.user,
        name: global1.name || global1.user,
        rows: uploadRows
      });
      const errors = res.data?.errors || [];
      setMessage(`${res.data?.saved || 0} rows uploaded${errors.length ? `, ${errors.length} skipped` : ""}.`);
      if (errors.length) setError(errors.map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk upload academic calendar.");
    } finally {
      setActionLoading(false);
    }
  };

  const regulationOptions = useMemo(() => uniqueSorted(
    regulationSubjectRows
      .filter((item) => !form.academicyear || item.academicyear === form.academicyear)
      .map((item) => item.regulation)
  ), [regulationSubjectRows, form.academicyear]);

  const programOptions = useMemo(() => uniqueSorted(
    regulationSubjectRows
      .filter((item) => (
        (!form.academicyear || item.academicyear === form.academicyear) &&
        (!form.regulation || item.regulation === form.regulation)
      ))
      .map((item) => item.program)
  ), [regulationSubjectRows, form.academicyear, form.regulation]);

  const programCodeOptions = useMemo(() => uniqueSorted(
    regulationSubjectRows
      .filter((item) => (
        (!form.academicyear || item.academicyear === form.academicyear) &&
        (!form.regulation || item.regulation === form.regulation) &&
        (!form.program || item.program === form.program)
      ))
      .map((item) => item.programcode)
  ), [regulationSubjectRows, form.academicyear, form.regulation, form.program]);

  const columns = useMemo(() => [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", minWidth: 160 },
    { field: "activitydate", headerName: "Date", width: 130, valueGetter: (params) => formatDate(params.row.activitydate) },
    { field: "type", headerName: "Type", width: 140 },
    { field: "ativity", headerName: "Activity", minWidth: 200, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 240, flex: 1 },
    { field: "program", headerName: "Program", minWidth: 160 },
    { field: "programcode", headerName: "Program Code", minWidth: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "level", headerName: "Level", width: 110 },
    { field: "status1", headerName: "Status", width: 120 },
    { field: "comments", headerName: "Comments", minWidth: 180 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => editRow(params.row)} disabled={actionLoading}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteRow(params.row)} disabled={actionLoading}>Delete</Button>
        </Stack>
      )
    }
  ], [actionLoading]);

  return (
    <MenuPageShell title="Academic Calendar">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 2, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Academic Calendar</Typography>
              <Typography color="text.secondary">Maintain working days, holidays and academic activities.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
              <Button variant="outlined" onClick={downloadTemplate}>Template</Button>
              <Button component="label" variant="contained" startIcon={<UploadFileIcon />} disabled={actionLoading}>
                {actionLoading ? "Processing..." : "Bulk Upload"}
                <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 2, border: "1px solid #e5e7eb" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => setField("academicyear", e.target.value)}>
                {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Regulation" value={form.regulation} onChange={(e) => setField("regulation", e.target.value)}>
                <MenuItem value="">Not specified</MenuItem>
                {regulationOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Program" value={form.program} onChange={(e) => setField("program", e.target.value)}>
                <MenuItem value="">Not specified</MenuItem>
                {programOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Program Code" value={form.programcode} onChange={(e) => setField("programcode", e.target.value)}>
                <MenuItem value="">Not specified</MenuItem>
                {programCodeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Type" value={form.type} onChange={(e) => setField("type", e.target.value)}>
                {types.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Activity Date" type="date" value={form.activitydate} onChange={(e) => setField("activitydate", e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Semester" value={form.semester} onChange={(e) => setField("semester", e.target.value)}>
                <MenuItem value="">Not specified</MenuItem>
                {Array.from({ length: 10 }, (_, index) => String(index + 1)).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Level" value={form.level} onChange={(e) => setField("level", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Activity" value={form.ativity} onChange={(e) => setField("ativity", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Status" value={form.status1} onChange={(e) => setField("status1", e.target.value)}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={9}>
              <TextField fullWidth label="Comments" value={form.comments} onChange={(e) => setField("comments", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button fullWidth variant="contained" onClick={saveRow} disabled={actionLoading} sx={{ height: 56 }}>{actionLoading ? "Saving..." : editId ? "Update" : "Add"}</Button>
                {editId && <Button fullWidth variant="outlined" onClick={resetForm} disabled={actionLoading} sx={{ height: 56 }}>Cancel</Button>}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e7eb" }}>
          <Box sx={{ height: 620, width: "100%" }}>
            <DataGrid
              rows={rows}
              getRowId={(row) => row._id}
              columns={columns}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "academic_calendar" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
