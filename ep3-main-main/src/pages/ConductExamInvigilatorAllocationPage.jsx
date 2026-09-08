import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const geminiModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];

const blankForm = {
  academicyear: "",
  regulation: "",
  exam: "",
  examcode: "",
  campus: "",
  building: "",
  room: "",
  invigilator: "",
  invigilatoremail: "",
  examdate: "",
  slot: "",
  attendance: ""
};

const filterLabels = {
  academicyear: "Academic Year",
  regulation: "Regulation",
  examcode: "Exam Code",
  campus: "Campus",
  building: "Building",
  room: "Room",
  invigilatoremail: "Invigilator Email",
  examdate: "Exam Date",
  slot: "Slot"
};

const uniq = (items) => [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const headerMap = {
  academicyear: "academicyear",
  academicyears: "academicyear",
  academicyear1: "academicyear",
  regulation: "regulation",
  exam: "exam",
  examname: "exam",
  examcode: "examcode",
  campus: "campus",
  building: "building",
  room: "room",
  examroom: "room",
  invigilator: "invigilator",
  invigilatorname: "invigilator",
  invigilatoremail: "invigilatoremail",
  invigilatorEmail: "invigilatoremail",
  examdate: "examdate",
  slot: "slot",
  examslot: "slot",
  attendance: "attendance"
};

export default function ConductExamInvigilatorAllocationPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({ exams: [], courses: [], rooms: [], invigilators: [] });
  const [form, setForm] = useState(blankForm);
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", examcode: "", campus: "", building: "", room: "", invigilatoremail: "", examdate: "", slot: "" });
  const [editId, setEditId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [autoForm, setAutoForm] = useState({ academicyear: "", exam: "", examcode: "", rules: "", geminiModel: "gemini-2.5-flash" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [geminiResponse, setGeminiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const loadOptions = async (params = {}) => {
    const res = await ep1.get("/api/v2/conductexam/invigilator-allocation-options", { params: { colid: global1.colid, ...params } });
    setOptions(res.data || { exams: [], courses: [], rooms: [], invigilators: [] });
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/conductexam/invigilator-allocation", { params });
      setRows(res.data?.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load invigilator allocation.");
    } finally {
      setLoading(false);
    }
  };

  const dropdownOptions = useMemo(() => ({
    academicyear: uniq([...(options.academicyears || []), ...rows.map((row) => row.academicyear)]),
    regulation: uniq([...(options.regulations || []), ...rows.map((row) => row.regulation)]),
    examcode: uniq([...(options.examcodes || []), ...rows.map((row) => row.examcode)]),
    exam: uniq([...(options.examsList || []), ...rows.map((row) => row.exam)]),
    campus: uniq([...(options.campuses || []), ...rows.map((row) => row.campus)]),
    building: uniq([...(options.buildings || []), ...rows.map((row) => row.building)]),
    room: uniq([...(options.roomnames || []), ...rows.map((row) => row.room)]),
    examdate: uniq([...(options.examdates || []), ...rows.map((row) => row.examdate)]),
    slot: uniq([...(options.slots || []), ...rows.map((row) => row.slot)]),
    invigilatoremail: uniq([...(options.invigilatoremails || []), ...rows.map((row) => row.invigilatoremail)])
  }), [options, rows]);

  const roomOptions = useMemo(() => (options.rooms || []).filter((row) => {
    if (form.academicyear && row.academicyear !== form.academicyear) return false;
    if (form.examcode && row.examcode !== form.examcode) return false;
    if (form.examdate && row.examdate !== form.examdate) return false;
    if (form.slot && row.slot !== form.slot) return false;
    return true;
  }), [options.rooms, form]);

  const selectedRoom = useMemo(() => roomOptions.find((row) => row.campus === form.campus && row.building === form.building && row.room === form.room && row.examdate === form.examdate && row.slot === form.slot) || null, [roomOptions, form]);
  const selectedInvigilator = useMemo(() => (options.invigilators || []).find((row) => row.invigilatoremail === form.invigilatoremail) || null, [options.invigilators, form.invigilatoremail]);

  const selectExam = (examcode, target = "form") => {
    const exam = (options.exams || []).find((item) => item.examcode === examcode);
    if (target === "auto") {
      const next = { ...autoForm, academicyear: exam?.academicyear || autoForm.academicyear, exam: exam?.examname || "", examcode };
      setAutoForm(next);
      loadOptions({ academicyear: next.academicyear, exam: next.exam, examcode });
      return;
    }
    setForm({ ...form, academicyear: exam?.academicyear || form.academicyear, exam: exam?.examname || "", examcode, campus: "", building: "", room: "", examdate: "", slot: "" });
    loadOptions({ academicyear: exam?.academicyear || form.academicyear, exam: exam?.examname || "", examcode });
  };

  const saveRow = async () => {
    try {
      setSaving(true);
      setError("");
      const payload = { ...form, id: editId, colid: global1.colid, user: global1.user };
      await ep1.post("/api/v2/conductexam/invigilator-allocation", payload);
      setMessage(editId ? "Invigilator allocation updated." : "Invigilator allocation added.");
      setForm(blankForm);
      setEditId("");
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save invigilator allocation.");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({
      academicyear: row.academicyear || "",
      regulation: row.regulation || "",
      exam: row.exam || "",
      examcode: row.examcode || "",
      campus: row.campus || "",
      building: row.building || "",
      room: row.room || "",
      invigilator: row.invigilator || "",
      invigilatoremail: row.invigilatoremail || "",
      examdate: row.examdate || "",
      slot: row.slot || "",
      attendance: row.attendance || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this invigilator allocation?")) return;
    await ep1.post("/api/v2/conductexam/invigilator-allocation-delete", { id, colid: global1.colid });
    setMessage("Invigilator allocation deleted.");
    await loadRows();
    await loadOptions();
  };

  const handleSelectionChange = (selection) => {
    if (Array.isArray(selection)) {
      setSelectedIds(selection);
      return;
    }
    if (selection?.ids instanceof Set) {
      const visibleIds = rows.map((row) => row._id);
      setSelectedIds(selection.type === "exclude" ? visibleIds.filter((id) => !selection.ids.has(id)) : [...selection.ids]);
      return;
    }
    setSelectedIds([]);
  };

  const bulkDeleteRows = async () => {
    if (!selectedIds.length) {
      setError("Select at least one invigilator allocation row.");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} selected invigilator allocation row${selectedIds.length === 1 ? "" : "s"}?`)) return;
    try {
      setBulkDeleting(true);
      setError("");
      const res = await ep1.post("/api/v2/conductexam/invigilator-allocation-bulk-delete", { colid: global1.colid, ids: selectedIds });
      setMessage(`${res.data?.deleted || 0} selected allocation row(s) deleted.`);
      setSelectedIds([]);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete selected allocation rows.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const downloadTemplate = () => {
    const firstRoom = (options.rooms || [])[0] || {};
    const firstInvigilator = (options.invigilators || [])[0] || {};
    const worksheet = XLSX.utils.json_to_sheet([{
      academicyear: firstRoom.academicyear || "2026-27",
      regulation: firstRoom.regulation || "NEP 2026",
      exam: firstRoom.exam || "Semester End Examination",
      examcode: firstRoom.examcode || "SEE-2026",
      campus: firstRoom.campus || "Main Campus",
      building: firstRoom.building || "Academic Block",
      room: firstRoom.room || "101",
      invigilator: firstInvigilator.invigilator || "Faculty Name",
      invigilatoremail: firstInvigilator.invigilatoremail || "faculty@example.com",
      examdate: firstRoom.examdate || "2026-12-10",
      slot: firstRoom.slot || "Slot 1",
      attendance: ""
    }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invigilator Allocation");
    XLSX.writeFile(workbook, "conduct_exam_invigilator_allocation_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setUploading(true);
      setError("");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const items = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => {
        const item = { rowNumber: index + 2 };
        Object.entries(row).forEach(([header, value]) => {
          const mapped = headerMap[normalizeHeader(header)];
          if (mapped) item[mapped] = value;
        });
        return item;
      });
      const res = await ep1.post("/api/v2/conductexam/invigilator-allocation-bulk", { colid: global1.colid, user: global1.user, items });
      const errors = res.data?.errors || [];
      setMessage(`${res.data?.saved || 0} rows uploaded${errors.length ? `, ${errors.length} errors` : ""}.`);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk upload invigilator allocation.");
    } finally {
      setUploading(false);
    }
  };

  const runAutoAllocation = async (useAi = false) => {
    try {
      if (!autoForm.academicyear || !autoForm.examcode) {
        setError("Select academic year and exam code for auto allocation.");
        return;
      }
      setError("");
      setMessage("");
      setGeminiResponse("");
      if (useAi) setAiLoading(true);
      else setAutoLoading(true);
      const res = await ep1.post(useAi ? "/api/v2/conductexam/invigilator-allocation-ai" : "/api/v2/conductexam/invigilator-allocation-auto", {
        colid: global1.colid,
        user: global1.user,
        ...autoForm
      });
      setMessage(`${res.data?.saved || 0} invigilator allocation rows saved.`);
      if (useAi) setGeminiResponse(res.data?.aiText || "Gemini did not return any visible response text.");
      setRows(res.data?.data || []);
      await loadOptions({ academicyear: autoForm.academicyear, exam: autoForm.exam, examcode: autoForm.examcode });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to auto allocate invigilators.");
    } finally {
      setAutoLoading(false);
      setAiLoading(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "regulation", headerName: "Regulation", width: 140 },
    { field: "exam", headerName: "Exam", minWidth: 180, flex: 1 },
    { field: "examcode", headerName: "Exam Code", width: 140 },
    { field: "examdate", headerName: "Exam Date", width: 130 },
    { field: "slot", headerName: "Slot", width: 150 },
    { field: "campus", headerName: "Campus", width: 140 },
    { field: "building", headerName: "Building", width: 150 },
    { field: "room", headerName: "Room", width: 110 },
    { field: "invigilator", headerName: "Invigilator", width: 180 },
    { field: "invigilatoremail", headerName: "Invigilator Email", width: 220 },
    { field: "attendance", headerName: "Attendance", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 170,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteRow(params.row._id)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Invigilator Allocation">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Invigilator Allocation</Typography>
              <Typography color="text.secondary">Allocate invigilators to exam rooms using seat allocation and scheduler data.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={downloadTemplate}>Template</Button>
              <Button component="label" variant="contained" startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <UploadFileIcon />} disabled={uploading}>
                {uploading ? "Uploading..." : "Bulk Upload"}
                <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {geminiResponse && (
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #bae6fd", bgcolor: "#f0f9ff", borderRadius: 2 }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>Gemini Response</Typography>
            <TextField
              fullWidth
              multiline
              minRows={6}
              value={geminiResponse}
              InputProps={{ readOnly: true }}
            />
          </Paper>
        )}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Typography fontWeight={900} sx={{ mb: 2 }}>Manual Entry</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => setForm({ ...form, academicyear: e.target.value, exam: "", examcode: "", campus: "", building: "", room: "", examdate: "", slot: "" })}>{dropdownOptions.academicyear.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Exam Code" value={form.examcode} onChange={(e) => selectExam(e.target.value)}>{dropdownOptions.examcode.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Exam" value={form.exam} onChange={(e) => setForm({ ...form, exam: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Regulation" value={form.regulation} onChange={(e) => setForm({ ...form, regulation: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                options={roomOptions}
                value={selectedRoom}
                isOptionEqualToValue={(option, value) => `${option.campus}-${option.building}-${option.room}-${option.examdate}-${option.slot}` === `${value.campus}-${value.building}-${value.room}-${value.examdate}-${value.slot}`}
                getOptionLabel={(option) => option ? `${option.examdate || ""} ${option.slot || ""} | ${option.campus || ""} / ${option.building || ""} / ${option.room || ""}` : ""}
                onChange={(event, value) => setForm({ ...form, ...(value || { campus: "", building: "", room: "", examdate: "", slot: "" }) })}
                renderInput={(params) => <TextField {...params} label="Room from Seat Allocation" />}
              />
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Exam Date" InputLabelProps={{ shrink: true }} value={form.examdate} onChange={(e) => setForm({ ...form, examdate: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Slot" value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>{dropdownOptions.slot.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Campus" value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Building" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                options={options.invigilators || []}
                value={selectedInvigilator}
                isOptionEqualToValue={(option, value) => option.invigilatoremail === value.invigilatoremail}
                getOptionLabel={(option) => option ? `${option.invigilator || ""}${option.invigilatoremail ? ` (${option.invigilatoremail})` : ""}` : ""}
                onChange={(event, value) => setForm({ ...form, invigilator: value?.invigilator || "", invigilatoremail: value?.invigilatoremail || "" })}
                renderInput={(params) => <TextField {...params} label="Invigilator" />}
              />
            </Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Invigilator Name" value={form.invigilator} onChange={(e) => setForm({ ...form, invigilator: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Invigilator Email" value={form.invigilatoremail} onChange={(e) => setForm({ ...form, invigilatoremail: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Attendance" value={form.attendance} onChange={(e) => setForm({ ...form, attendance: e.target.value })}><MenuItem value="">Blank</MenuItem><MenuItem value="Present">Present</MenuItem><MenuItem value="Absent">Absent</MenuItem></TextField></Grid>
            <Grid item xs={12} md={1.5}><Button fullWidth variant="contained" disabled={saving} onClick={saveRow} sx={{ height: 56 }}>{saving ? "Saving..." : editId ? "Update" : "Save"}</Button></Grid>
            <Grid item xs={12} md={1.5}><Button fullWidth variant="outlined" onClick={() => { setForm(blankForm); setEditId(""); }} sx={{ height: 56 }}>Clear</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Typography fontWeight={900} sx={{ mb: 2 }}>Auto Allocation</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={autoForm.academicyear} onChange={(e) => setAutoForm({ ...autoForm, academicyear: e.target.value, exam: "", examcode: "" })}>{dropdownOptions.academicyear.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Exam Code" value={autoForm.examcode} onChange={(e) => selectExam(e.target.value, "auto")}>{dropdownOptions.examcode.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Exam" value={autoForm.exam} onChange={(e) => setAutoForm({ ...autoForm, exam: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Gemini Model" value={autoForm.geminiModel} onChange={(e) => setAutoForm({ ...autoForm, geminiModel: e.target.value })}>{geminiModels.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={5}
                label="Rules for Gemini allocation"
                value={autoForm.rules}
                onChange={(e) => setAutoForm({ ...autoForm, rules: e.target.value })}
                placeholder="Example: Do not assign the same invigilator to two rooms in the same slot. Prefer even distribution. Keep faculty from the same department away from their own course rooms."
              />
            </Grid>
            <Grid item xs={12} md={3}><Button fullWidth variant="contained" startIcon={autoLoading ? <CircularProgress size={18} color="inherit" /> : <AutoModeIcon />} disabled={autoLoading || aiLoading} onClick={() => runAutoAllocation(false)} sx={{ height: 48 }}>{autoLoading ? "Allocating..." : "Auto Allocate"}</Button></Grid>
            <Grid item xs={12} md={3}><Button fullWidth variant="outlined" startIcon={aiLoading ? <CircularProgress size={18} color="inherit" /> : <AutoModeIcon />} disabled={autoLoading || aiLoading} onClick={() => runAutoAllocation(true)} sx={{ height: 48 }}>{aiLoading ? "Processing..." : "Gemini Rule Allocation"}</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            {Object.keys(filters).map((key) => (
              <Grid item xs={12} md={2} key={key}>
                <TextField select fullWidth label={filterLabels[key]} value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {(dropdownOptions[key] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={() => loadRows()} sx={{ height: 56 }}>Apply</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => { const next = { academicyear: "", regulation: "", examcode: "", campus: "", building: "", room: "", invigilatoremail: "", examdate: "", slot: "" }; setFilters(next); loadRows(next); }} sx={{ height: 56 }}>Clear</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => setSelectedIds(rows.map((row) => row._id))} disabled={!rows.length || bulkDeleting} sx={{ height: 56 }}>Select All Loaded</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="text" onClick={() => setSelectedIds([])} disabled={!selectedIds.length || bulkDeleting} sx={{ height: 56 }}>Clear Selection</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" color="error" onClick={bulkDeleteRows} disabled={!selectedIds.length || bulkDeleting} sx={{ height: 56 }}>{bulkDeleting ? "Deleting..." : `Delete Selected${selectedIds.length ? ` (${selectedIds.length})` : ""}`}</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Box sx={{ height: 620 }}>
            <DataGrid
              rows={rows}
              getRowId={(row) => row._id}
              columns={columns}
              loading={loading}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectedIds}
              onRowSelectionModelChange={handleSelectionChange}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "conduct_exam_invigilator_allocation" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
