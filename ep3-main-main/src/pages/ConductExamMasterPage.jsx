import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const academicYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const sessions = ["Odd", "Even"];
const examTypes = ["Regular", "Supplementary"];
const blankForm = { academicyear: "2026-27", examname: "", examcode: "", session: "Odd", type: "Regular" };

export default function ConductExamMasterPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    try {
      const res = await ep1.get("/api/v2/conductexam/exams", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exams.");
    }
  };

  const saveRow = async () => {
    if (!form.academicyear || !form.examname || !form.examcode || !form.session || !form.type) {
      setError("All fields are required.");
      return;
    }
    try {
      setError("");
      await ep1.post("/api/v2/conductexam/exams", { ...form, id: editId, colid: global1.colid, user: global1.user });
      setMessage(editId ? "Exam updated." : "Exam created.");
      setForm(blankForm);
      setEditId("");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save exam.");
    }
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({
      academicyear: row.academicyear || "2026-27",
      examname: row.examname || "",
      examcode: row.examcode || "",
      session: row.session || "Odd",
      type: row.type || "Regular"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this exam?")) return;
    try {
      await ep1.post("/api/v2/conductexam/exams-delete", { id, colid: global1.colid });
      setMessage("Exam deleted.");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete exam.");
    }
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      { academicyear: "2026-27", examname: "Semester End Examination", examcode: "SEE-2026-ODD", session: "Odd", type: "Regular" }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Exams");
    XLSX.writeFile(workbook, "conduct_exam_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const items = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({
        rowNumber: index + 2,
        academicyear: row.academicyear || row["Academic Year"] || "",
        examname: row.examname || row.exam || row["Exam Name"] || "",
        examcode: row.examcode || row["Exam Code"] || "",
        session: row.session || row.Session || "",
        type: row.type || row.Type || ""
      }));
      const res = await ep1.post("/api/v2/conductexam/exams-bulk", { colid: global1.colid, user: global1.user, items });
      setMessage(`${res.data?.saved || 0} exams uploaded.`);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload exams.");
    }
  };

  const columns = useMemo(() => [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "examname", headerName: "Exam Name", minWidth: 220, flex: 1 },
    { field: "examcode", headerName: "Exam Code", minWidth: 160, flex: 1 },
    { field: "session", headerName: "Session", width: 120 },
    { field: "type", headerName: "Type", width: 160 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteRow(params.row._id)}>Delete</Button>
        </Stack>
      )
    }
  ], []);

  return (
    <MenuPageShell title="Create Exam">
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Create Exam</Typography>
            <Typography color="text.secondary">Create and manage examination master records.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={downloadTemplate}>Template</Button>
            <Button component="label" variant="contained" startIcon={<UploadFileIcon />}>
              Bulk Upload
              <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
            </Button>
          </Stack>
        </Stack>
      </Paper>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2.2}><TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => setForm({ ...form, academicyear: e.target.value })}>{academicYears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Exam Name" value={form.examname} onChange={(e) => setForm({ ...form, examname: e.target.value })} /></Grid>
          <Grid item xs={12} md={2.2}><TextField fullWidth label="Exam Code" value={form.examcode} onChange={(e) => setForm({ ...form, examcode: e.target.value })} /></Grid>
          <Grid item xs={12} md={1.6}><TextField select fullWidth label="Session" value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })}>{sessions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{examTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1}><Button fullWidth variant="contained" onClick={saveRow} sx={{ height: 56 }}>{editId ? "Update" : "Save"}</Button></Grid>
        </Grid>
      </Paper>
      <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Box sx={{ height: 560 }}>
          <DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} disableRowSelectionOnClick />
        </Box>
      </Paper>
    </Box>
    </MenuPageShell>
  );
}
