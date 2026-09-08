import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
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
import MenuPageShell from "./MenuPageShell";

const emptyForm = {
  id: "",
  year: "2026-27",
  level: "",
  type: "",
  program: "",
  programcode: "",
  Order: "",
  status1: "Active",
  comments: ""
};

const defaultYears = ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const defaultLevels = ["Secondary", "Post Secondary", "primary"];
const defaultTypes = ["ICSE", "ISC", "CBSE", "State Board"];
const defaultStatuses = ["Active", "Inactive"];
const defaultClasses = ["Nursery 1", "Nursery 2", ...Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`)];

export default function SchoolClassManagementPage({ embedded = false, onRowsChange }) {
  const navigate = useNavigate();
  const colid = useMemo(() => global1.colid, []);
  const currentUser = useMemo(() => global1.user, []);
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({ years: defaultYears, types: defaultTypes, levels: defaultLevels, statuses: defaultStatuses });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [customClass, setCustomClass] = useState(false);

  const merged = (base, extra) => Array.from(new Set([...(base || []), ...(extra || [])].filter(Boolean))).sort();

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/mprograms-management/options", { params: { colid } });
    setOptions({
      years: merged(defaultYears, res.data.years),
      types: defaultTypes,
      levels: defaultLevels,
      statuses: merged(defaultStatuses, res.data.statuses)
    });
  };

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/mprograms-management", { params: { colid } });
      const nextRows = res.data.data || [];
      setRows(nextRows);
      if (onRowsChange) onRowsChange(nextRows);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load classes");
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

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectClass = (value) => {
    if (value === "__custom__") {
      setCustomClass(true);
      setForm((prev) => ({ ...prev, program: "" }));
      return;
    }
    setCustomClass(false);
    setForm((prev) => ({ ...prev, program: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setCustomClass(false);
    setError("");
  };

  const payload = () => ({
    ...form,
    name: form.program,
    colid,
    user: currentUser
  });

  const saveRow = async () => {
    if (!form.program || !form.programcode) {
      setError("Class and class code are required");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (form.id) {
        await ep1.post("/api/v2/mprograms-management-update", payload());
        setMessage("Class updated");
      } else {
        await ep1.post("/api/v2/mprograms-management", payload());
        setMessage("Class added");
      }
      resetForm();
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save class");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setForm({
      id: row._id,
      year: row.year || "2026-27",
      level: row.level || "",
      type: row.type || "",
      program: row.program || row.name || "",
      programcode: row.programcode || "",
      Order: row.Order ?? "",
      status1: row.status1 || "Active",
      comments: row.comments || ""
    });
    setCustomClass(!defaultClasses.includes(row.program || row.name || ""));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this class?")) return;
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/mprograms-management-delete", { id: row._id, colid });
      setMessage("Class deleted");
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to delete class");
    }
  };

  const downloadTemplate = () => {
    const sample = [{
      year: "2026-27",
      level: "Secondary",
      type: "CBSE",
      program: "Class 10",
      programcode: "CLS10",
      Order: 1,
      status1: "Active",
      comments: ""
    }];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Class Management");
    XLSX.writeFile(wb, "School_Class_Management_Template.xlsx");
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
        const res = await ep1.post("/api/v2/mprograms-management-bulk", { colid, user: currentUser, rows: jsonRows });
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
    { field: "year", headerName: "Academic year", minWidth: 140 },
    { field: "level", headerName: "Level", minWidth: 130 },
    { field: "type", headerName: "Board", minWidth: 150 },
    { field: "program", headerName: "Class", minWidth: 260, flex: 1 },
    { field: "programcode", headerName: "Class code", minWidth: 150 },
    { field: "Order", headerName: "Order", minWidth: 110, type: "number" },
    { field: "status1", headerName: "Status", minWidth: 120 },
    { field: "comments", headerName: "Comments", minWidth: 260 },
    { field: "user", headerName: "User", minWidth: 170 }
  ];

  const content = (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Class Management</Typography>
          <Typography variant="body2" color="text.secondary">Create and manage school classes with board, level and status.</Typography>
        </Box>
        {!embedded && <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
          <TextField select size="small" label="Academic year" value={form.year} onChange={(e) => updateForm("year", e.target.value)}>
            {options.years.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Level" value={form.level} onChange={(e) => updateForm("level", e.target.value)}>
            {options.levels.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Board" value={form.type} onChange={(e) => updateForm("type", e.target.value)}>
            {options.types.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Status" value={form.status1} onChange={(e) => updateForm("status1", e.target.value)}>
            {options.statuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Class" value={customClass ? "__custom__" : form.program} onChange={(e) => selectClass(e.target.value)} sx={{ gridColumn: { xs: "1", md: customClass ? "span 1" : "span 2" } }}>
            {defaultClasses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            <MenuItem value="__custom__">Custom class</MenuItem>
          </TextField>
          {customClass && (
            <TextField size="small" label="Custom class" value={form.program} onChange={(e) => updateForm("program", e.target.value)} />
          )}
          <TextField size="small" label="Class code" value={form.programcode} onChange={(e) => updateForm("programcode", e.target.value)} />
          <TextField size="small" type="number" label="Order" value={form.Order} onChange={(e) => updateForm("Order", e.target.value)} />
          <TextField size="small" label="Comments" value={form.comments} onChange={(e) => updateForm("comments", e.target.value)} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
          <Button variant="contained" startIcon={<Save />} disabled={saving || !form.program || !form.programcode} onClick={saveRow}>
            {form.id ? "Update" : "Save"}
          </Button>
          <Button variant="outlined" onClick={resetForm}>New</Button>
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
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "school_class_management" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1450 }}
        />
      </Paper>
    </Container>
  );

  return embedded ? content : <MenuPageShell title="Class Management">{content}</MenuPageShell>;
}
