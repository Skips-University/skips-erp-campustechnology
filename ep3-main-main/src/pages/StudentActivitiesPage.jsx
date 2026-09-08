import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, Delete, Download, Edit, Print, Refresh, Save, UploadFile } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterLabels = {
  academicyear: "Academic year",
  admissionyear: "Admission year",
  name: "Name",
  email: "Email",
  phone: "Phone",
  regno: "Reg No",
  program: "Program",
  programcode: "Program code",
  semester: "Semester",
  section: "Section",
  category: "Category",
  gender: "Gender",
  Major: "Major",
  Minor: "Minor"
};

const blankActivity = {
  id: "",
  activitytype: "",
  activitydetails: "",
  activitydate: new Date().toISOString().slice(0, 10),
  documenturl: "",
  status: "Active",
  document: null
};

const activityTypes = ["Sports", "Cultural", "NSS", "NCC", "Club", "Seminar", "Workshop", "Competition", "Social work", "Other"];

export default function StudentActivitiesPage() {
  const navigate = useNavigate();
  const [filterMeta, setFilterMeta] = useState({ fields: [], options: {} });
  const [filters, setFilters] = useState([{ id: Date.now(), field: "academicyear", value: "" }]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activities, setActivities] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [form, setForm] = useState(blankActivity);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const colid = global1.colid;
  const currentUser = global1.user;

  const activeFilters = useMemo(() => filters.filter((item) => item.field && item.value), [filters]);
  const selectedActivities = useMemo(() => {
    if (!selectedStudent) return [];
    return activities.filter((item) => {
      const regMatch = selectedStudent.regno && item.regno === selectedStudent.regno;
      const emailMatch = selectedStudent.email && item.email === selectedStudent.email;
      const idMatch = selectedStudent._id && item.studentid === selectedStudent._id;
      return regMatch || emailMatch || idMatch;
    });
  }, [activities, selectedStudent]);

  useEffect(() => {
    loadMeta();
    loadActivities();
    loadInstitution();
  }, []);

  const loadMeta = async () => {
    try {
      const res = await ep1.get("/api/v2/student-activities/options", { params: { colid } });
      setFilterMeta({ fields: res.data.fields || [], options: res.data.options || {} });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student filter options");
    }
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get(`/vins?colid=${colid}`);
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadActivities = async (student = selectedStudent) => {
    setLoading(true);
    setError("");
    try {
      const params = { colid };
      if (student?.regno) params.regno = student.regno;
      const res = await ep1.get("/api/v2/student-activities", { params });
      setActivities(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load activities");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (id, field, value) => {
    setFilters((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value, ...(field === "field" ? { value: "" } : {}) } : item)));
  };

  const addFilter = () => {
    const nextField = filterMeta.fields.find((field) => !filters.some((item) => item.field === field)) || "name";
    setFilters((prev) => [...prev, { id: Date.now(), field: nextField, value: "" }]);
  };

  const removeFilter = (id) => {
    setFilters((prev) => prev.length === 1 ? prev : prev.filter((item) => item.id !== id));
  };

  const searchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/student-activities/students", { colid, filters: activeFilters });
      setStudents(res.data.data || []);
      if (!(res.data.data || []).length) setSelectedStudent(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to search students");
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setForm(blankActivity);
    loadActivities(student);
  };

  const resetForm = () => {
    setForm(blankActivity);
  };

  const activityFormPayload = () => ({
    colid,
    user: currentUser,
    studentid: selectedStudent?._id || "",
    student: selectedStudent?.name || "",
    regno: selectedStudent?.regno || "",
    email: selectedStudent?.email || "",
    phone: selectedStudent?.phone || "",
    academicyear: selectedStudent?.academicyear || "",
    program: selectedStudent?.program || "",
    programcode: selectedStudent?.programcode || "",
    semester: selectedStudent?.semester || "",
    section: selectedStudent?.section || "",
    activitytype: form.activitytype,
    activitydetails: form.activitydetails,
    activitydate: form.activitydate,
    documenturl: form.documenturl,
    status: form.status
  });

  const saveActivity = async () => {
    if (!selectedStudent) return setError("Please select a student first");
    if (!form.activitytype || !form.activitydetails) return setError("Activity type and details are required");
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = new FormData();
      Object.entries(activityFormPayload()).forEach(([key, value]) => payload.append(key, value || ""));
      if (form.id) payload.append("id", form.id);
      if (form.document) payload.append("document", form.document);
      const endpoint = form.id ? "/api/v2/student-activities-update" : "/api/v2/student-activities";
      await ep1.post(endpoint, payload, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(form.id ? "Activity updated" : "Activity added");
      resetForm();
      await loadActivities(selectedStudent);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save activity");
    } finally {
      setSaving(false);
    }
  };

  const editActivity = (row) => {
    setForm({
      id: row._id,
      activitytype: row.activitytype || "",
      activitydetails: row.activitydetails || "",
      activitydate: row.activitydate || "",
      documenturl: row.documenturl || "",
      status: row.status || "Active",
      document: null
    });
    if (!selectedStudent) {
      setSelectedStudent({
        _id: row.studentid,
        name: row.student,
        regno: row.regno,
        email: row.email,
        phone: row.phone,
        academicyear: row.academicyear,
        program: row.program,
        programcode: row.programcode,
        semester: row.semester,
        section: row.section
      });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteActivity = async (row) => {
    if (!window.confirm("Delete this activity?")) return;
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/student-activities-delete", { id: row._id, colid });
      setMessage("Activity deleted");
      await loadActivities(selectedStudent);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete activity");
    }
  };

  const downloadTemplate = () => {
    const sample = [{
      student: selectedStudent?.name || "Student Name",
      regno: selectedStudent?.regno || "REG001",
      email: selectedStudent?.email || "student@example.com",
      phone: selectedStudent?.phone || "",
      academicyear: selectedStudent?.academicyear || "2026-27",
      program: selectedStudent?.program || "",
      programcode: selectedStudent?.programcode || "",
      semester: selectedStudent?.semester || "1",
      section: selectedStudent?.section || "A",
      activitytype: "Sports",
      activitydetails: "Inter college tournament participation",
      activitydate: new Date().toISOString().slice(0, 10),
      documenturl: "",
      status: "Active"
    }];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Activities");
    XLSX.writeFile(wb, "Student_Activities_Template.xlsx");
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
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const res = await ep1.post("/api/v2/student-activities-bulk", { colid, user: currentUser, rows });
        const errors = res.data.errors || [];
        setMessage(`Bulk upload completed. Inserted: ${res.data.inserted || 0}${errors.length ? `, Errors: ${errors.length}` : ""}`);
        if (errors.length) setError(errors.map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
        await loadActivities(selectedStudent);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Unable to upload Excel");
      } finally {
        setSaving(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const studentColumns = [
    {
      field: "select",
      headerName: "Select",
      width: 110,
      renderCell: (params) => <Button size="small" variant="contained" onClick={() => selectStudent(params.row)}>Select</Button>
    },
    { field: "name", headerName: "Student", minWidth: 220, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "email", headerName: "Email", minWidth: 220 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "academicyear", headerName: "Academic year", minWidth: 130 },
    { field: "program", headerName: "Program", minWidth: 190 },
    { field: "programcode", headerName: "Program code", minWidth: 140 },
    { field: "semester", headerName: "Semester", minWidth: 100 },
    { field: "section", headerName: "Section", minWidth: 100 }
  ];

  const activityColumns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 170,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<Edit />} onClick={() => editActivity(params.row)}>Edit</Button>
          <Button size="small" color="error" startIcon={<Delete />} onClick={() => deleteActivity(params.row)}>Delete</Button>
        </Stack>
      )
    },
    { field: "student", headerName: "Student", minWidth: 210 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "academicyear", headerName: "Academic year", minWidth: 130 },
    { field: "program", headerName: "Program", minWidth: 180 },
    { field: "semester", headerName: "Semester", minWidth: 100 },
    { field: "section", headerName: "Section", minWidth: 100 },
    { field: "activitytype", headerName: "Activity type", minWidth: 160 },
    { field: "activitydetails", headerName: "Details", minWidth: 300, flex: 1 },
    { field: "activitydate", headerName: "Activity date", minWidth: 130 },
    {
      field: "documenturl",
      headerName: "Document",
      minWidth: 150,
      renderCell: (params) => params.value ? <Link href={params.value} target="_blank" rel="noreferrer">Open</Link> : "-"
    },
    { field: "status", headerName: "Status", minWidth: 100 }
  ];

  const printStudent = selectedStudent || {};

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #student-activity-print, #student-activity-print * { visibility: visible; }
          #student-activity-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <Stack className="no-print" direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Student Extra Curricular Activities</Typography>
          <Typography variant="body2" color="text.secondary">Search students, record activities, upload documents, and print studentwise activity history.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
      </Stack>

      {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert className="no-print" severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Student Search</Typography>
          <Button variant="outlined" onClick={addFilter}>Add filter</Button>
        </Stack>
        <Grid container spacing={2}>
          {filters.map((filter) => (
            <React.Fragment key={filter.id}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Field</InputLabel>
                  <Select label="Field" value={filter.field} onChange={(e) => updateFilter(filter.id, "field", e.target.value)}>
                    {filterMeta.fields.map((field) => <MenuItem key={field} value={field}>{filterLabels[field] || field}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Value</InputLabel>
                  <Select label="Value" value={filter.value} onChange={(e) => updateFilter(filter.id, "value", e.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    {(filterMeta.options[filter.field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth color="error" variant="outlined" startIcon={<Delete />} onClick={() => removeFilter(filter.id)} sx={{ height: 56 }}>Remove</Button>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          <Button variant="contained" onClick={searchStudents}>Search students</Button>
          <Button variant="text" startIcon={<Refresh />} onClick={loadMeta}>Refresh options</Button>
          <Chip label={`Students loaded: ${students.length}`} />
          {selectedStudent && <Chip color="primary" label={`Selected: ${selectedStudent.name} (${selectedStudent.regno || selectedStudent.email})`} />}
        </Stack>
      </Paper>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={students.map((row) => ({ ...row, id: row._id }))}
          columns={studentColumns}
          loading={loading}
          autoHeight
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_search" } } }}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1450 }}
        />
      </Paper>

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{form.id ? "Edit Activity" : "Add Activity"}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Selected student" value={selectedStudent ? `${selectedStudent.name} (${selectedStudent.regno || selectedStudent.email})` : ""} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Activity type" value={form.activitytype} onChange={(e) => setForm({ ...form, activitytype: e.target.value })}>
              {activityTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="date" label="Activity date" value={form.activitydate} onChange={(e) => setForm({ ...form, activitydate: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
              {form.document ? form.document.name : "Upload document"}
              <input hidden type="file" onChange={(e) => setForm({ ...form, document: e.target.files?.[0] || null })} />
            </Button>
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField fullWidth multiline minRows={2} label="Details of activities" value={form.activitydetails} onChange={(e) => setForm({ ...form, activitydetails: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Document link" value={form.documenturl} onChange={(e) => setForm({ ...form, documenturl: e.target.value })} helperText="Optional: paste link or upload file" />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          <Button variant="contained" startIcon={<Save />} disabled={saving || !selectedStudent} onClick={saveActivity}>{form.id ? "Update" : "Save"}</Button>
          <Button variant="outlined" onClick={resetForm}>New</Button>
          <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Template</Button>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>
            Bulk upload
            <input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} />
          </Button>
          <Button variant="text" startIcon={<Refresh />} onClick={() => loadActivities(selectedStudent)}>Refresh activities</Button>
          <Button variant="outlined" startIcon={<Print />} disabled={!selectedStudent} onClick={() => window.print()}>Print selected student</Button>
        </Stack>
      </Paper>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={activities.map((row) => ({ ...row, id: row._id }))}
          columns={activityColumns}
          loading={loading}
          autoHeight
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_activities" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1750 }}
        />
      </Paper>

      <Paper id="student-activity-print" sx={{ maxWidth: "210mm", mx: "auto", p: 3, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 72, height: 72, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Student Extra Curricular Activities</Typography>
          <Typography variant="caption">Generated on {new Date().toLocaleDateString()}</Typography>
        </Stack>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          {[
            ["Student", printStudent.name],
            ["Reg No", printStudent.regno],
            ["Email", printStudent.email],
            ["Phone", printStudent.phone],
            ["Academic Year", printStudent.academicyear],
            ["Program", printStudent.program],
            ["Program Code", printStudent.programcode],
            ["Semester / Section", `${printStudent.semester || ""}${printStudent.section ? ` / ${printStudent.section}` : ""}`]
          ].map(([label, value]) => (
            <Grid item xs={6} key={label}>
              <Box sx={{ border: "1px solid #cbd5e1", p: 1, minHeight: 42 }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="body2" fontWeight={700}>{value || "-"}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ border: "1px solid #cbd5e1" }}>
          <Grid container>
            {["Date", "Type", "Details", "Document", "Status"].map((heading, index) => (
              <Grid item xs={index === 2 ? 4 : 2} key={heading} sx={{ bgcolor: "#e2e8f0", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75 }}>
                <Typography variant="caption" fontWeight={900}>{heading}</Typography>
              </Grid>
            ))}
            {(selectedActivities.length ? selectedActivities : []).map((row) => (
              <React.Fragment key={row._id}>
                <Grid item xs={2} sx={{ borderRight: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", p: 0.75 }}><Typography variant="caption">{row.activitydate || "-"}</Typography></Grid>
                <Grid item xs={2} sx={{ borderRight: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", p: 0.75 }}><Typography variant="caption">{row.activitytype || "-"}</Typography></Grid>
                <Grid item xs={4} sx={{ borderRight: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", p: 0.75 }}><Typography variant="caption" sx={{ whiteSpace: "pre-wrap" }}>{row.activitydetails || "-"}</Typography></Grid>
                <Grid item xs={2} sx={{ borderRight: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", p: 0.75 }}><Typography variant="caption">{row.documenturl ? "Attached" : "-"}</Typography></Grid>
                <Grid item xs={2} sx={{ borderBottom: "1px solid #e5e7eb", p: 0.75 }}><Typography variant="caption">{row.status || "-"}</Typography></Grid>
              </React.Fragment>
            ))}
            {!selectedActivities.length && (
              <Grid item xs={12} sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2">Select a student to view printable activity history.</Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        <Grid container spacing={4} sx={{ mt: 5 }}>
          <Grid item xs={4}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Prepared By</Typography></Box></Grid>
          <Grid item xs={4}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Checked By</Typography></Box></Grid>
          <Grid item xs={4}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Approved By</Typography></Box></Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
