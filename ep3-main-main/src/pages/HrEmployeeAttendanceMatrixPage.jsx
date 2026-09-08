import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import * as XLSX from "xlsx";
import { Alert, Autocomplete, Box, Button, Container, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { Add, ArrowBack, Delete, Edit, FileDownload, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blank = { name: "Employee Attendance Approval", department: "", status: "Active", levels: [{ level: 1, approvername: "", approveremail: "", approverrole: "" }] };

export default function HrEmployeeAttendanceMatrixPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({ users: [] });
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
    loadOptions();
  }, []);

  const loadRows = async () => {
    const res = await ep1.get("/api/v2/hrattendance/matrix", { params: { colid: global1.colid } });
    setRows(res.data?.data || []);
  };

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/hrattendance/options", { params: { colid: global1.colid } });
    setOptions(res.data || { users: [] });
  };

  const save = async () => {
    try {
      const endpoint = editingId ? "/api/v2/hrattendance/matrix/update" : "/api/v2/hrattendance/matrix";
      await ep1.post(endpoint, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setForm(blank);
      setEditingId("");
      setMessage("Saved");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save matrix");
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this approval matrix?")) return;
    await ep1.post("/api/v2/hrattendance/matrix/delete", { id: row._id, colid: global1.colid });
    setMessage("Deleted");
    loadRows();
  };

  const updateLevel = (index, field, value) => {
    setForm((prev) => {
      const levels = [...prev.levels];
      levels[index] = { ...levels[index], [field]: value };
      return { ...prev, levels };
    });
  };

  const employeeOptions = useMemo(
    () => [...(options.users || [])].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [options.users]
  );

  const findUserByLevel = (level) => employeeOptions.find((item) => {
    const email = item.email || item.user || "";
    return email && email === level.approveremail;
  }) || null;

  const setApprover = (index, value) => {
    setForm((prev) => {
      const levels = [...prev.levels];
      levels[index] = {
        ...levels[index],
        approvername: value?.name || "",
        approveremail: value?.email || value?.user || "",
        approverrole: value?.role || levels[index].approverrole || ""
      };
      return { ...prev, levels };
    });
  };

  const downloadTemplate = () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ name: "Employee Attendance Approval", department: "", status: "Active", approvername1: "Approver Name", approveremail1: "approver@example.com", approverrole1: "HR", approvername2: "", approveremail2: "", approverrole2: "" }]), "Matrix");
    XLSX.writeFile(workbook, "employee_attendance_approval_matrix_template.xlsx");
  };

  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("colid", global1.colid);
      data.append("user", global1.user);
      await ep1.post("/api/v2/hrattendance/matrix/bulkupload", data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage("Bulk upload completed");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    } finally {
      event.target.value = "";
    }
  };

  const columns = [
    { field: "name", headerName: "Name", minWidth: 220, flex: 1 },
    { field: "department", headerName: "Department", minWidth: 160 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "levelsText", headerName: "Levels", minWidth: 350, flex: 1, valueGetter: (params) => (params.row.levels || []).map((l) => `${l.level}. ${l.approvername || ""} ${l.approveremail || ""}`).join(" | ") },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      minWidth: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...blank, ...row, levels: row.levels?.length ? row.levels : blank.levels }); }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Employee Attendance Approval Matrix">
      <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Employee Attendance Approval Matrix</Typography>
          <Typography variant="body2" color="text.secondary">Define dynamic approval levels for attendance add/edit requests.</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" startIcon={<ArrowBack />} variant="outlined">Back</Button>
      </Stack>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Department" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} helperText="Keep blank for all departments" /></Grid>
          <Grid item xs={12} md={4}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
          {form.levels.map((level, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Level" value={level.level} onChange={(e) => updateLevel(index, "level", Number(e.target.value))} /></Grid>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  options={employeeOptions}
                  value={findUserByLevel(level)}
                  onChange={(event, value) => setApprover(index, value)}
                  getOptionLabel={(option) => `${option.name || "Unnamed"} - ${option.email || option.user || ""}`}
                  isOptionEqualToValue={(option, value) => (option.email || option.user || "") === (value.email || value.user || "")}
                  renderInput={(params) => <TextField {...params} label="Approver Name / Email" />}
                />
              </Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Approver Email" value={level.approveremail} InputProps={{ readOnly: true }} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Approver Role" value={level.approverrole} onChange={(e) => updateLevel(index, "approverrole", e.target.value)} /></Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button startIcon={<Add />} variant="outlined" onClick={() => setForm((p) => ({ ...p, levels: [...p.levels, { level: p.levels.length + 1, approvername: "", approveremail: "", approverrole: "" }] }))}>Add Level</Button>
              <Button startIcon={<Save />} variant="contained" onClick={save}>{editingId ? "Update" : "Save"}</Button>
              <Button startIcon={<FileDownload />} variant="outlined" onClick={downloadTemplate}>Template</Button>
              <Button component="label" startIcon={<UploadFile />} variant="outlined">Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={uploadExcel} /></Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 2 }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} autoHeight slots={{ toolbar: GridToolbar }} disableRowSelectionOnClick /></Paper>
      </Container>
    </MenuPageShell>
  );
}
