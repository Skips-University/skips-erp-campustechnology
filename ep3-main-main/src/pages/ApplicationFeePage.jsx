import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, Delete, Download, Edit, Refresh, Save, UploadFile } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyForm = {
  id: "",
  academicyear: "2026-27",
  program: "",
  programcode: "",
  amount: "",
  active: "Yes"
};

const money = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });

const ApplicationFeePage = () => {
  const navigate = useNavigate();
  const colid = useMemo(() => global1.colid, []);
  const currentUser = useMemo(() => global1.user, []);
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState(["2026-27"]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/applicationfee/options", { params: { colid } });
    setPrograms(res.data.programs || []);
    setAcademicYears(res.data.academicYears?.length ? res.data.academicYears : ["2026-27"]);
  };

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/applicationfee", { params: { colid } });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load application fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }
    loadOptions().catch((err) => setError(err.response?.data?.message || err.message));
    loadRows();
  }, [colid]);

  const selectProgram = (value) => {
    const program = programs.find((item) => `${item.programcode}||${item.program}` === value);
    setForm({
      ...form,
      program: program?.program || "",
      programcode: program?.programcode || ""
    });
  };

  const saveRow = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = { ...form, colid, user: currentUser };
      const res = form.id
        ? await ep1.post("/api/v2/applicationfee/update", payload)
        : await ep1.post("/api/v2/applicationfee", payload);
      setMessage(form.id ? "Application fee updated." : "Application fee saved.");
      setForm(emptyForm);
      await loadRows();
      await loadOptions();
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save application fee");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setForm({
      id: row._id,
      academicyear: row.academicyear || "2026-27",
      program: row.program || "",
      programcode: row.programcode || "",
      amount: row.amount || "",
      active: row.active || "Yes"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this application fee?")) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/applicationfee/delete", { id: row._id, colid });
      setMessage("Application fee deleted.");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to delete application fee");
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = () => {
    const sample = [{
      academicyear: "2026-27",
      program: programs[0]?.program || "B.Com",
      programcode: programs[0]?.programcode || "BCOM",
      amount: 500,
      active: "Yes"
    }];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Application Fee");
    XLSX.writeFile(wb, "Application_Fee_Template.xlsx");
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setSaving(true);
      setError("");
      setMessage("");
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const res = await ep1.post("/api/v2/applicationfee/bulk", { colid, user: currentUser, rows: jsonRows });
        const errors = res.data.errors || [];
        setMessage(`Bulk upload completed. Inserted: ${res.data.inserted || 0}${errors.length ? `, Errors: ${errors.length}` : ""}`);
        if (errors.length) setError(errors.map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
        await loadRows();
        await loadOptions();
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Unable to upload Excel");
      } finally {
        setSaving(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 170,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<Edit />} onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="error" startIcon={<Delete />} onClick={() => deleteRow(params.row)}>Delete</Button>
        </Stack>
      )
    },
    { field: "academicyear", headerName: "Academic year", minWidth: 150 },
    { field: "program", headerName: "Program", minWidth: 220, flex: 1 },
    { field: "programcode", headerName: "Program code", minWidth: 160 },
    { field: "amount", headerName: "Amount", minWidth: 130, valueFormatter: (params) => money(params.value) },
    { field: "active", headerName: "Active", minWidth: 120 },
    { field: "user", headerName: "User", minWidth: 180 }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Application fee</Typography>
          <Typography variant="body2" color="text.secondary">Configure application fee amount by academic year and program.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(5, 1fr)" }, gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Academic year</InputLabel>
            <Select label="Academic year" value={form.academicyear} onChange={(e) => setForm({ ...form, academicyear: e.target.value })}>
              {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ gridColumn: { xs: "1", md: "span 2" } }}>
            <InputLabel>Program</InputLabel>
            <Select
              label="Program"
              value={form.programcode || form.program ? `${form.programcode}||${form.program}` : ""}
              onChange={(e) => selectProgram(e.target.value)}
            >
              {programs.map((item) => (
                <MenuItem key={`${item.programcode}-${item.program}`} value={`${item.programcode}||${item.program}`}>
                  {item.programcode} - {item.program}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField size="small" label="Program code" value={form.programcode} InputProps={{ readOnly: true }} />
          <TextField size="small" label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <FormControl fullWidth size="small">
            <InputLabel>Active</InputLabel>
            <Select label="Active" value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value })}>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
          <Button variant="contained" startIcon={<Save />} disabled={saving || !form.academicyear || !form.program || !form.programcode || !form.amount} onClick={saveRow}>
            {form.id ? "Update" : "Save"}
          </Button>
          <Button variant="outlined" onClick={() => setForm(emptyForm)}>New</Button>
          <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Template</Button>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>
            Bulk upload
            <input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} />
          </Button>
          <Button variant="text" startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, overflowX: "auto" }}>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          autoHeight
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          sx={{ minWidth: 1200 }}
        />
      </Paper>
    </Container>
  );
};

export default ApplicationFeePage;
