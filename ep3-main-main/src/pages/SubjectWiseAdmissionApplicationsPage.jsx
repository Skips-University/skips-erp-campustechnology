import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ep1 from "../api/ep1";
import global1 from "./global1";

const fixedFieldOptions = [
  { field: "academicyear", label: "Academic Year" },
  { field: "admission_stream", label: "Stream" },
  { field: "programapplied", label: "Program" },
  { field: "admission_semester", label: "Semester" },
  { field: "admission_subjects", label: "Subjects" },
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "phone", label: "Phone" },
  { field: "category", label: "Category" },
  { field: "gender", label: "Gender" },
  { field: "programcode", label: "Program Code" },
  { field: "applicationstatus", label: "Status" }
];

const subjectField = "admission_subjects";

const formatLabel = (value) => String(value || "")
  .replace(/^admission_/, "")
  .replace(/_/g, " ")
  .replace(/\b\w/g, (char) => char.toUpperCase());

const splitSubjects = (value) => String(value || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const getFieldValue = (row, field) => {
  if (field === "admission_stream") return row.extraFields?.admission_stream || row.programtype || "";
  if (field === "admission_semester") return row.extraFields?.admission_semester || "";
  if (field === subjectField) return row.extraFields?.admission_subjects || "";
  if (row[field] !== undefined && row[field] !== null) return row[field];
  return row.extraFields?.[field] ?? "";
};

const makeEmptyFilter = () => ({
  id: `${Date.now()}-${Math.random()}`,
  field: "academicyear",
  value: "",
  values: []
});

export default function SubjectWiseAdmissionApplicationsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([makeEmptyFilter()]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await ep1.get(`/admission-dynamic/applications?colid=${global1.colid}`);
      const data = res.data || [];
      setRows(data.filter((item) => item.extraFields?.admission_subjects || item.extraFields?.admission_semester || item.extraFields?.admission_stream));
    } catch (err) {
      alert(err.response?.data?.msg || "Unable to load subject admission applications");
    } finally {
      setLoading(false);
    }
  };

  const fieldOptions = useMemo(() => {
    const map = new Map(fixedFieldOptions.map((item) => [item.field, item]));
    rows.forEach((row) => {
      Object.keys(row.extraFields || {}).forEach((key) => {
        if (!map.has(key)) map.set(key, { field: key, label: formatLabel(key) });
      });
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const getOptionsForField = (field) => {
    const values = new Set();
    rows.forEach((row) => {
      const value = getFieldValue(row, field);
      if (field === subjectField) {
        splitSubjects(value).forEach((subject) => values.add(subject));
      } else if (value !== undefined && value !== null && String(value).trim()) {
        values.add(String(value).trim());
      }
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => filters.every((filter) => {
      if (!filter.field) return true;
      if (filter.field === subjectField) {
        if (!filter.values?.length) return true;
        const rowSubjects = splitSubjects(getFieldValue(row, subjectField)).map((item) => item.toLowerCase());
        return filter.values.every((subject) => rowSubjects.includes(String(subject).toLowerCase()));
      }
      if (!filter.value) return true;
      return String(getFieldValue(row, filter.field)).toLowerCase() === String(filter.value).toLowerCase();
    }));
  }, [rows, filters]);

  const updateFilter = (id, key, value) => {
    setFilters((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, [key]: value };
      if (key === "field") {
        next.value = "";
        next.values = [];
      }
      return next;
    }));
  };

  const removeFilter = (id) => {
    setFilters((prev) => (prev.length === 1 ? [makeEmptyFilter()] : prev.filter((item) => item.id !== id)));
  };

  const deleteApplication = async (row) => {
    const ok = window.confirm(`Delete application for ${row.name || row.email || "this student"}?`);
    if (!ok) return;

    try {
      await ep1.post("/admission-dynamic/applications-delete", {
        id: row._id,
        colid: global1.colid
      });
      setRows((prev) => prev.filter((item) => item._id !== row._id));
    } catch (err) {
      alert(err.response?.data?.msg || "Unable to delete application");
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", minWidth: 140 },
    { field: "name", headerName: "Name", minWidth: 180 },
    { field: "email", headerName: "Email", minWidth: 220 },
    { field: "phone", headerName: "Phone", minWidth: 140 },
    { field: "category", headerName: "Category", minWidth: 120 },
    { field: "gender", headerName: "Gender", minWidth: 120 },
    { field: "programapplied", headerName: "Program", minWidth: 220 },
    { field: "programcode", headerName: "Program Code", minWidth: 180 },
    {
      field: "stream",
      headerName: "Stream",
      minWidth: 160,
      valueGetter: (params) => params.row.extraFields?.admission_stream || params.row.programtype || ""
    },
    {
      field: "semester",
      headerName: "Semester",
      minWidth: 120,
      valueGetter: (params) => params.row.extraFields?.admission_semester || ""
    },
    {
      field: "subjects",
      headerName: "Subjects",
      minWidth: 280,
      valueGetter: (params) => params.row.extraFields?.admission_subjects || ""
    },
    { field: "applicationstatus", headerName: "Status", minWidth: 130 },
    {
      field: "profile",
      headerName: "View",
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => navigate(`/dynamic-admission-profile-subjects/${params.row._id}`)}
        >
          View
        </Button>
      )
    },
    {
      field: "delete",
      headerName: "Delete",
      minWidth: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => deleteApplication(params.row)}
        >
          Delete
        </Button>
      )
    }
  ];

  return (
    <Grid container spacing={2} padding={2}>
      <Grid item xs={12}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>Subject Wise Admission</Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Dynamic Filters</Typography>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setFilters((prev) => [...prev, makeEmptyFilter()])}>
              Add Filter
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {filters.map((filter) => {
              const options = getOptionsForField(filter.field);
              return (
                <React.Fragment key={filter.id}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Field</InputLabel>
                      <Select
                        label="Field"
                        value={filter.field}
                        onChange={(event) => updateFilter(filter.id, "field", event.target.value)}
                      >
                        {fieldOptions.map((item) => (
                          <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <FormControl fullWidth>
                      <InputLabel>{filter.field === subjectField ? "Subjects" : "Value"}</InputLabel>
                      <Select
                        multiple={filter.field === subjectField}
                        label={filter.field === subjectField ? "Subjects" : "Value"}
                        value={filter.field === subjectField ? filter.values : filter.value}
                        onChange={(event) => updateFilter(filter.id, filter.field === subjectField ? "values" : "value", event.target.value)}
                        input={<OutlinedInput label={filter.field === subjectField ? "Subjects" : "Value"} />}
                        renderValue={(selected) => Array.isArray(selected) ? selected.join(", ") : selected}
                      >
                        {filter.field !== subjectField && <MenuItem value="">All</MenuItem>}
                        {options.map((option) => (
                          <MenuItem key={option} value={option}>
                            {filter.field === subjectField && <Checkbox checked={filter.values.includes(option)} />}
                            <ListItemText primary={option} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button fullWidth color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={() => removeFilter(filter.id)} sx={{ height: 56 }}>
                      Remove
                    </Button>
                  </Grid>
                </React.Fragment>
              );
            })}
          </Grid>

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2, gap: 1 }}>
            {filters.map((filter) => {
              const fieldLabel = fieldOptions.find((item) => item.field === filter.field)?.label || filter.field;
              const valueLabel = filter.field === subjectField ? filter.values.join(", ") : filter.value;
              return valueLabel ? <Chip key={filter.id} label={`${fieldLabel}: ${valueLabel}`} /> : null;
            })}
            {!filters.some((filter) => filter.value || filter.values?.length) && <Chip label="All subject admissions" />}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Applications</Typography>
            <Typography color="text.secondary">{filteredRows.length} records</Typography>
          </Stack>
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(row) => row._id}
              slots={{ toolbar: GridToolbar }}
              loading={loading}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
