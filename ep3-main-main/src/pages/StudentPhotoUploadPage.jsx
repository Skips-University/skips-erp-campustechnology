import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  LinearProgress
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Add, Delete, Refresh, UploadFile } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const filterFields = [
  { field: "admissionyear", label: "Admission Year" },
  { field: "academicyear", label: "Academic Year" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "regulation", label: "Regulation" },
  { field: "Major", label: "Major" },
  { field: "Minor", label: "Minor" },
  { field: "semester", label: "Semester" },
  { field: "section", label: "Section" },
  { field: "category", label: "Category" },
  { field: "gender", label: "Gender" },
  { field: "department", label: "Department" },
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "phone", label: "Phone" },
  { field: "regno", label: "Reg No" }
];

const makeFilter = (field = "academicyear") => ({ id: `${Date.now()}-${Math.random()}`, field, value: "" });

export default function StudentPhotoUploadPage() {
  const [filters, setFilters] = useState([makeFilter()]);
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filterOptions, setFilterOptions] = useState({});

  const selectedStudent = useMemo(() => rows.find((row) => row._id === selectedId) || null, [rows, selectedId]);

  useEffect(() => {
    loadStudents();
  }, []);

  const params = () => filters.reduce((acc, item) => {
    if (item.field && item.value) acc[item.field] = item.value;
    return acc;
  }, { colid: global1.colid });

  const loadStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/student-photo/students", { params: params() });
      const data = res.data?.data || [];
      setRows(data);
      setFilterOptions(res.data?.options || {});
      if (selectedId && !data.some((row) => row._id === selectedId)) setSelectedId("");
    } catch (err) {
      setRows([]);
      setFilterOptions({});
      setError(err.response?.data?.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (id, key, value) => {
    setFilters((prev) => prev.map((item) => item.id === id ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item));
  };

  const removeFilter = (id) => {
    setFilters((prev) => prev.length === 1 ? [makeFilter()] : prev.filter((item) => item.id !== id));
  };

  const uploadPhoto = async () => {
    if (!selectedStudent) {
      setError("Please select a student.");
      return;
    }
    if (!file) {
      setError("Please select a photo file.");
      return;
    }
    setUploading(true);
    setMessage("");
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("colid", global1.colid);
      form.append("studentid", selectedStudent._id);
      form.append("user", global1.user || "");
      const res = await ep1.post("/api/v2/student-photo/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage(`Photo uploaded for ${res.data?.data?.name || selectedStudent.name}.`);
      setFile(null);
      await loadStudents();
      setSelectedId(res.data?.data?._id || selectedStudent._id);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "email", headerName: "Email", minWidth: 210 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "programcode", headerName: "Program Code", minWidth: 130 },
    { field: "semester", headerName: "Semester", minWidth: 100 },
    { field: "section", headerName: "Section", minWidth: 100 },
    {
      field: "photo",
      headerName: "Photo",
      minWidth: 160,
      renderCell: (params) => params.value ? <a href={params.value} target="_blank" rel="noreferrer">View photo</a> : "Not uploaded"
    }
  ];

  return (
    <MenuPageShell title="Student Photo Upload">
      <Stack spacing={2}>
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={800}>Search Students</Typography>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<Add />} variant="outlined" onClick={() => setFilters((prev) => [...prev, makeFilter("name")])}>Add Filter</Button>
              <Button startIcon={<Refresh />} variant="contained" onClick={loadStudents} disabled={loading}>Apply</Button>
            </Stack>
          </Stack>
          <Grid container spacing={2}>
            {filters.map((filter) => (
              <React.Fragment key={filter.id}>
                <Grid item xs={12} md={4}>
                  <TextField select fullWidth label="Field" value={filter.field} onChange={(event) => updateFilter(filter.id, "field", event.target.value)}>
                    {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    freeSolo
                    fullWidth
                    options={filterOptions[filter.field] || []}
                    value={filter.value || ""}
                    inputValue={filter.value || ""}
                    onInputChange={(event, value) => updateFilter(filter.id, "value", value)}
                    onChange={(event, value) => updateFilter(filter.id, "value", value || "")}
                    renderInput={(params) => <TextField {...params} label="Value" />}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth color="error" variant="outlined" startIcon={<Delete />} onClick={() => removeFilter(filter.id)} sx={{ height: 56 }}>Remove</Button>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Upload Photo</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                select
                fullWidth
                label="Selected student"
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {rows.map((row) => (
                  <MenuItem key={row._id} value={row._id}>{row.name} - {row.regno || row.email}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                {file ? file.name : "Choose photo"}
                <input hidden type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="contained" onClick={uploadPhoto} disabled={uploading || !selectedStudent || !file} sx={{ height: 56 }}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </Grid>
            {uploading && <Grid item xs={12}><LinearProgress /></Grid>}
          </Grid>
          {selectedStudent?.photo && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Current photo</Typography>
              <Box component="img" src={selectedStudent.photo} alt={selectedStudent.name} sx={{ width: 130, height: 150, objectFit: "cover", borderRadius: 2, border: "1px solid #ddd" }} />
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 1 }}>
          <Box sx={{ height: 540 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading}
              onRowClick={(params) => setSelectedId(params.row._id)}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_photo_upload" } } }}
            />
          </Box>
        </Paper>
      </Stack>
    </MenuPageShell>
  );
}
