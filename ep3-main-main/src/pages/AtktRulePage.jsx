import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blank = { academicyear: "2026-27", regulation: "", program: "", programcode: "", semester: "", maxbacklog: 0 };
const headers = { academicyear: "Academic Year", regulation: "Regulation", program: "Program", programcode: "Program Code", semester: "Semester", maxbacklog: "Max Backlog" };

export default function AtktRulePage() {
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [options, setOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const loadOptions = async (params = {}) => {
    try {
      const res = await ep1.get("/api/v2/atktrules/options", { params: { colid: global1.colid, ...params } });
      setOptions(res.data || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load ATKT options");
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/atktrules", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load ATKT rules");
    } finally {
      setLoading(false);
    }
  };

  const programOptions = useMemo(() => (options.programs || []).map((item) => {
    const [program, programcode] = String(item).split("|||");
    return { program, programcode };
  }).filter((item) => item.programcode), [options.programs]);
  const academicYearOptions = useMemo(() => {
    const values = new Set([form.academicyear, ...(options.academicyears || [])].filter(Boolean));
    return [...values].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  }, [form.academicyear, options.academicyears]);

  const update = (field, value) => {
    const next = { ...form, [field]: value };
    if (field === "academicyear") {
      next.regulation = "";
      next.program = "";
      next.programcode = "";
      next.semester = "";
      loadOptions({ academicyear: value });
    }
    if (field === "regulation") {
      next.program = "";
      next.programcode = "";
      next.semester = "";
      loadOptions({ academicyear: next.academicyear, regulation: value });
    }
    if (field === "programcode") {
      const selected = programOptions.find((item) => item.programcode === value);
      next.program = selected?.program || "";
      next.semester = "";
      loadOptions({ academicyear: next.academicyear, regulation: next.regulation, programcode: value });
    }
    setForm(next);
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/atktrules", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "ATKT rule updated." : "ATKT rule saved.");
      setEditingId("");
      setForm(blank);
      await Promise.all([loadOptions(), loadRows()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save ATKT rule");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({ ...blank, ...row });
    loadOptions({ academicyear: row.academicyear, regulation: row.regulation, programcode: row.programcode });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this ATKT rule?")) return;
    await ep1.post("/api/v2/atktrules/delete", { id: row._id, colid: global1.colid });
    setMessage("ATKT rule deleted.");
    loadRows();
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{ academicyear: "2026-27", regulation: "NEP 2026", program: "B.Com", programcode: "BCOM", semester: "3", maxbacklog: 2 }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ATKT Rules");
    XLSX.writeFile(workbook, "atkt_rule_template.xlsx");
  };

  const bulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setBulkUploading(true);
      setError("");
      setMessage("");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const items = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({ rowNumber: index + 2, ...row }));
      const res = await ep1.post("/api/v2/atktrules/bulkupload", { colid: global1.colid, user: global1.user, items });
      const errors = res.data?.errors || [];
      setMessage(`${res.data?.inserted || 0} ATKT rules uploaded.${errors.length ? ` ${errors.length} rows skipped.` : ""}`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload ATKT rules");
    } finally {
      setBulkUploading(false);
    }
  };

  const columns = [
    ...Object.entries(headers).map(([field, headerName]) => ({ field, headerName, width: field === "program" ? 220 : 140 })),
    {
      field: "actions",
      headerName: "Actions",
      width: 170,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteRow(params.row)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="ATKT Rule">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>ATKT Rule</Typography>
              <Typography color="text.secondary">Define the maximum permissible backlogs by academic year, regulation, program and semester.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={downloadTemplate}>Template</Button>
              <Button component="label" variant="contained" startIcon={<UploadFileIcon />} disabled={bulkUploading}>
                {bulkUploading ? "Uploading..." : "Bulk Upload"}
                <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={bulkUpload} />
              </Button>
            </Stack>
          </Stack>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => update("academicyear", e.target.value)}>{academicYearOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Regulation" value={form.regulation} onChange={(e) => update("regulation", e.target.value)}><MenuItem value="">Select</MenuItem>{(options.regulations || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Program" value={form.programcode} onChange={(e) => update("programcode", e.target.value)}><MenuItem value="">Select</MenuItem>{programOptions.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Semester" value={form.semester} onChange={(e) => update("semester", e.target.value)}><MenuItem value="">Select</MenuItem>{(options.semesters || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth type="number" label="Max Backlog" value={form.maxbacklog} onChange={(e) => update("maxbacklog", e.target.value)} /></Grid>
            <Grid item xs={12} md={1.5}><Button fullWidth variant="contained" onClick={save} disabled={saving} sx={{ height: 56 }}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</Button></Grid>
            {editingId && <Grid item xs={12} md={1.5}><Button fullWidth variant="outlined" onClick={() => { setEditingId(""); setForm(blank); }} sx={{ height: 56 }}>Cancel</Button></Grid>}
          </Grid>
        </Paper>
        <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e5e7eb", borderRadius: 2, overflowX: "auto" }}>
          <DataGrid
            rows={rows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "atkt_rules" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            sx={{ minWidth: 1000 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
