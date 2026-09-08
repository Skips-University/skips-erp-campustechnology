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
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const years = Array.from({ length: 10 }, (_, index) => `${2023 + index}-${String(24 + index).padStart(2, "0")}`);
const accreditationTypes = ["NAAC", "NBA", "NIRF", "QS", "THE", "Times Ranking"];

const emptyForm = {
  academicyear: "2026-27",
  accreditation: "NAAC",
  institution: global1.insname || "",
  program: "",
  programcode: "",
  startdate: "",
  validitydate: "",
  grade: ""
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const uniqueSorted = (values) => Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export default function AccreditationStatusPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [programRows, setProgramRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
    loadPrograms();
  }, []);

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/accreditationstatus", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load accreditation status.");
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async () => {
    try {
      const res = await ep1.get("/api/v2/mprograms-management", { params: { colid: global1.colid } });
      setProgramRows(res.data?.data || []);
    } catch (err) {
      setProgramRows([]);
    }
  };

  const setField = (field, value) => {
    setForm((prev) => {
      if (field === "academicyear") return { ...prev, academicyear: value, program: "", programcode: "" };
      if (field === "program") {
        const match = programRows.find((item) => (
          (item.program || item.name) === value &&
          (!prev.academicyear || item.year === prev.academicyear || item.academicyear === prev.academicyear)
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
    if (!form.academicyear || !form.accreditation) {
      setError("Academic year and accreditation are required.");
      return;
    }
    setActionLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        id: editId,
        colid: global1.colid,
        user: global1.user,
        name: global1.name || global1.user
      };
      await ep1.post(editId ? "/api/v2/accreditationstatus/update" : "/api/v2/accreditationstatus", payload);
      setMessage(editId ? "Accreditation status updated." : "Accreditation status added.");
      resetForm();
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save accreditation status.");
    } finally {
      setActionLoading(false);
    }
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({
      academicyear: row.academicyear || "2026-27",
      accreditation: row.accreditation || "NAAC",
      institution: row.institution || global1.insname || "",
      program: row.program || "",
      programcode: row.programcode || "",
      startdate: formatDate(row.startdate),
      validitydate: formatDate(row.validitydate),
      grade: row.grade || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this accreditation status?")) return;
    setActionLoading(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/accreditationstatus/delete", { id: row._id, colid: global1.colid });
      setMessage("Accreditation status deleted.");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete accreditation status.");
    } finally {
      setActionLoading(false);
    }
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        academicyear: "2026-27",
        accreditation: "NAAC",
        institution: global1.insname || "Institution name",
        program: "Institution",
        programcode: "",
        startdate: "2026-07-01",
        validitydate: "2031-06-30",
        grade: "A"
      },
      {
        academicyear: "2026-27",
        accreditation: "NBA",
        institution: global1.insname || "Institution name",
        program: "B.Tech Computer Science",
        programcode: "BTCS",
        startdate: "2026-07-01",
        validitydate: "2029-06-30",
        grade: "Accredited"
      }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accreditation Status");
    XLSX.writeFile(workbook, "accreditation_status_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setActionLoading(true);
    setError("");
    setMessage("");
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const uploadRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const res = await ep1.post("/api/v2/accreditationstatus/bulk", {
        colid: global1.colid,
        user: global1.user,
        name: global1.name || global1.user,
        rows: uploadRows
      });
      const errors = res.data?.errors || [];
      setMessage(`${res.data?.saved || 0} rows uploaded${errors.length ? `, ${errors.length} skipped` : ""}.`);
      if (errors.length) setError(errors.map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk upload accreditation status.");
    } finally {
      setActionLoading(false);
    }
  };

  const programOptions = useMemo(() => uniqueSorted(
    programRows
      .filter((item) => !form.academicyear || item.year === form.academicyear || item.academicyear === form.academicyear)
      .map((item) => item.program || item.name)
  ), [programRows, form.academicyear]);

  const programCodeOptions = useMemo(() => uniqueSorted(
    programRows
      .filter((item) => (
        (!form.academicyear || item.year === form.academicyear || item.academicyear === form.academicyear) &&
        (!form.program || item.program === form.program || item.name === form.program)
      ))
      .map((item) => item.programcode)
  ), [programRows, form.academicyear, form.program]);

  const columns = useMemo(() => [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "accreditation", headerName: "Accreditation", width: 150 },
    { field: "institution", headerName: "Institution", minWidth: 220, flex: 1 },
    { field: "program", headerName: "Program", minWidth: 200, flex: 1 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "startdate", headerName: "Start Date", width: 130, valueGetter: (params) => formatDate(params.row.startdate) },
    { field: "validitydate", headerName: "Validity Date", width: 140, valueGetter: (params) => formatDate(params.row.validitydate) },
    { field: "grade", headerName: "Grade", width: 130 },
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
    <MenuPageShell title="Accreditation Status">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 2, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <WorkspacePremiumIcon color="primary" />
                <Typography variant="h5" fontWeight={900}>Institutionwise Accreditation Status</Typography>
              </Stack>
              <Typography color="text.secondary">Maintain accreditation and ranking validity for institution and programs.</Typography>
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
              <TextField select fullWidth label="Accreditation" value={form.accreditation} onChange={(e) => setField("accreditation", e.target.value)}>
                {accreditationTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Institution" value={form.institution} onChange={(e) => setField("institution", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Program" value={form.program} onChange={(e) => setField("program", e.target.value)}>
                <MenuItem value="">Institution level</MenuItem>
                {programOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Program Code" value={form.programcode} onChange={(e) => setField("programcode", e.target.value)}>
                <MenuItem value="">Institution level</MenuItem>
                {programCodeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Start Date" type="date" value={form.startdate} onChange={(e) => setField("startdate", e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Validity Date" type="date" value={form.validitydate} onChange={(e) => setField("validitydate", e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Grade / Rank" value={form.grade} onChange={(e) => setField("grade", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1}>
                <Button fullWidth variant="contained" onClick={saveRow} disabled={actionLoading} sx={{ height: 56 }}>
                  {actionLoading ? "Saving..." : editId ? "Update" : "Add"}
                </Button>
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
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "accreditation_status" } } }}
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
