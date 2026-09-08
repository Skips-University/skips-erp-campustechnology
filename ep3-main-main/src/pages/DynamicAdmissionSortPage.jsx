import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ep1 from "../api/ep1";
import global1 from "./global1";

const standardSortColumns = [
  { field: "name", label: "Name", type: "text" },
  { field: "email", label: "Email", type: "text" },
  { field: "phone", label: "Phone", type: "text" },
  { field: "academicyear", label: "Academic Year", type: "text" },
  { field: "category", label: "Category", type: "text" },
  { field: "gender", label: "Gender", type: "text" },
  { field: "externaltheorymarks", label: "External Theory Marks", type: "number" },
  { field: "englishmarks", label: "English Marks", type: "number" },
  { field: "tenthmarks", label: "Tenth Marks", type: "number" },
  { field: "twelvemarks", label: "Twelve Marks", type: "number" },
  { field: "age", label: "Age", type: "number" },
  { field: "dateofbirth", label: "Date of Birth", type: "date" },
  { field: "dateofapplication", label: "Date of Application", type: "date" },
  { field: "applicationstatus", label: "Application Status", type: "text" }
];

const baseGridColumns = [
  { field: "rank", headerName: "Rank", width: 80 },
  { field: "name", headerName: "Name", flex: 1.2 },
  { field: "email", headerName: "Email", flex: 1.3 },
  { field: "phone", headerName: "Phone", flex: 1 },
  { field: "category", headerName: "Category", flex: 0.8 },
  { field: "programapplied", headerName: "Program", flex: 1.5 },
  { field: "programcode", headerName: "Program Code", flex: 1 },
  { field: "externaltheorymarks", headerName: "External Theory", flex: 1 },
  { field: "englishmarks", headerName: "English", flex: 0.8 },
  { field: "tenthmarks", headerName: "Tenth", flex: 0.8 },
  { field: "twelvemarks", headerName: "Twelve", flex: 0.8 },
  { field: "age", headerName: "Age", flex: 0.6 },
  { field: "applicationstatus", headerName: "Status", flex: 0.9 }
];

const numericTypes = new Set(["number"]);

const getSortValue = (row, field, type) => {
  const value = row[field];
  if (numericTypes.has(type)) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
  }
  if (type === "date") {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return String(value || "").toLowerCase();
};

export default function DynamicAdmissionSortPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fields, setFields] = useState([]);
  const [programcode, setProgramcode] = useState("");
  const [category, setCategory] = useState("");
  const [selectedSorts, setSelectedSorts] = useState([]);
  const [sortDirections, setSortDirections] = useState({});
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadOptions();
    loadFields();
  }, []);

  const loadOptions = async () => {
    const res = await ep1.get(`/admission-dynamic/filter-options?colid=${global1.colid}`);
    setPrograms(res.data?.programs || []);
    setCategories(res.data?.categories || []);
  };

  const loadFields = async () => {
    const res = await ep1.get(`/admission-dynamic/fields?colid=${global1.colid}`);
    setFields(res.data || []);
  };

  const sortColumns = useMemo(() => {
    const extraColumns = fields.map((field) => ({
      field: `extra_${field.fieldname}`,
      label: field.label,
      type: field.type === "number" || field.type === "date" ? field.type : "text"
    }));
    return [...standardSortColumns, ...extraColumns];
  }, [fields]);

  const selectedSortLabels = useMemo(() => {
    const labelMap = new Map(sortColumns.map((column) => [column.field, column.label]));
    return selectedSorts.map((field) => labelMap.get(field) || field).join(", ");
  }, [selectedSorts, sortColumns]);

  const gridColumns = useMemo(() => {
    const selectedSet = new Set(selectedSorts);
    const extraGridColumns = fields
      .filter((field) => selectedSet.has(`extra_${field.fieldname}`))
      .map((field) => ({
        field: `extra_${field.fieldname}`,
        headerName: field.label,
        flex: 1
      }));
    return [...baseGridColumns, ...extraGridColumns];
  }, [fields, selectedSorts]);

  const flattenRows = (data) => data.map((item) => {
    const extraFields = item.extraFields || {};
    const extraValues = {};
    Object.entries(extraFields).forEach(([key, value]) => {
      extraValues[`extra_${key}`] = value;
    });
    return { ...item, ...extraValues };
  });

  const sortRows = (data) => {
    const columnMap = new Map(sortColumns.map((column) => [column.field, column]));
    const sorted = [...data].sort((a, b) => {
      for (const field of selectedSorts) {
        const column = columnMap.get(field) || { field, type: "text" };
        const direction = sortDirections[field] || (column.type === "number" ? "desc" : "asc");
        const aValue = getSortValue(a, field, column.type);
        const bValue = getSortValue(b, field, column.type);
        if (aValue < bValue) return direction === "asc" ? -1 : 1;
        if (aValue > bValue) return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted.map((item, index) => ({ ...item, rank: index + 1 }));
  };

  const loadApplications = async () => {
    if (!programcode || !category) {
      alert("Select program and category");
      return;
    }

    const params = new URLSearchParams({
      colid: global1.colid,
      programcode,
      category
    });
    const res = await ep1.get(`/admission-dynamic/applications?${params.toString()}`);
    const flattened = flattenRows(res.data || []);
    setRows(sortRows(flattened));
  };

  const updateSelectedSorts = (value) => {
    const next = typeof value === "string" ? value.split(",") : value;
    setSelectedSorts(next);
    setSortDirections((prev) => {
      const allowed = new Set(next);
      const updated = {};
      Object.entries(prev).forEach(([field, direction]) => {
        if (allowed.has(field)) updated[field] = direction;
      });
      next.forEach((field) => {
        const column = sortColumns.find((item) => item.field === field);
        updated[field] = updated[field] || (column?.type === "number" ? "desc" : "asc");
      });
      return updated;
    });
  };

  const applySortOnly = () => {
    setRows((prev) => sortRows(prev));
  };

  return (
    <Grid container spacing={2} padding={2}>
      <Grid item xs={12}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>Dynamic Admission Sort</Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Program" value={programcode} onChange={(e) => setProgramcode(e.target.value)}>
                {programs.map((program) => (
                  <MenuItem key={program.programcode} value={program.programcode}>
                    {program.programapplied} ({program.programcode})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <InputLabel>Sort Criteria</InputLabel>
                <Select
                  multiple
                  value={selectedSorts}
                  onChange={(e) => updateSelectedSorts(e.target.value)}
                  input={<OutlinedInput label="Sort Criteria" />}
                  renderValue={() => selectedSortLabels}
                >
                  {sortColumns.map((column) => (
                    <MenuItem key={column.field} value={column.field}>
                      <Checkbox checked={selectedSorts.includes(column.field)} />
                      <ListItemText primary={column.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedSorts.map((field, index) => {
              const column = sortColumns.find((item) => item.field === field);
              return (
                <Grid item xs={12} md={3} key={field}>
                  <TextField
                    select
                    fullWidth
                    label={`${index + 1}. ${column?.label || field}`}
                    value={sortDirections[field] || "asc"}
                    onChange={(e) => setSortDirections((prev) => ({ ...prev, [field]: e.target.value }))}
                  >
                    <MenuItem value="asc">Ascending</MenuItem>
                    <MenuItem value="desc">Descending</MenuItem>
                  </TextField>
                </Grid>
              );
            })}

            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={loadApplications}>Load and Sort</Button>
                <Button variant="outlined" onClick={applySortOnly} disabled={rows.length === 0}>Apply Sort</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Sorted Admission Data</Typography>
            <Typography color="text.secondary">{rows.length} records</Typography>
          </Stack>
          <Box sx={{ height: 620, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={gridColumns}
              getRowId={(row) => row._id}
              slots={{ toolbar: GridToolbar }}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
