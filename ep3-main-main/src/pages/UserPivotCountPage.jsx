import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Delete, Print, Refresh, Search } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const defaultFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "role", label: "Role" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "category", label: "Category" },
  { field: "gender", label: "Gender" },
  { field: "Major", label: "Major" },
  { field: "Minor", label: "Minor" },
  { field: "AEC", label: "AEC" },
  { field: "SEC", label: "SEC" },
  { field: "quota", label: "Quota" },
  { field: "department", label: "Department" },
  { field: "state", label: "State" },
  { field: "city", label: "City" },
  { field: "district", label: "District" },
  { field: "section", label: "Section" },
  { field: "semester", label: "Semester" }
];

const blankField = "academicyear";

export default function UserPivotCountPage() {
  const colid = useMemo(() => global1.colid, []);
  const [fields, setFields] = useState(defaultFields);
  const [selectedFields, setSelectedFields] = useState([blankField]);
  const [report, setReport] = useState({ total: 0, pivotRows: [], selectedFilters: [], institution: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    generateReport([blankField]);
  }, []);

  const fieldLabel = (field) => fields.find((item) => item.field === field)?.label || field;

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/user-pivot-report/options", { params: { colid } });
      setFields(res.data?.fields || defaultFields);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fields");
    }
  };

  const cleanFields = (sourceFields = selectedFields) => [...new Set(sourceFields.filter(Boolean))];

  const generateReport = async (sourceFields = selectedFields) => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/user-pivot-report", {
        colid,
        filters: [],
        pivotFields: cleanFields(sourceFields),
        groupTogether: true
      });
      setReport({
        total: res.data?.total || 0,
        pivotRows: res.data?.pivotRows || [],
        selectedFilters: res.data?.selectedFilters || [],
        institution: res.data?.institution || null
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate user pivot count");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (index, value) => {
    setSelectedFields((prev) => prev.map((field, itemIndex) => (itemIndex === index ? value : field)));
  };

  const addField = () => setSelectedFields((prev) => [...prev, blankField]);
  const removeField = (index) => setSelectedFields((prev) => (prev.length === 1 ? [blankField] : prev.filter((_, itemIndex) => itemIndex !== index)));
  const resetFields = () => {
    const next = [blankField];
    setSelectedFields(next);
    generateReport(next);
  };

  const columns = [
    ...cleanFields().map((field) => ({
      field,
      headerName: fieldLabel(field),
      width: 180,
      valueGetter: (params) => params.row.values?.[field] || "Not specified"
    })),
    { field: "count", headerName: "Total Count", width: 160, type: "number" }
  ];

  const institutionName = report.institution?.institutionname || global1.insname || "Institution";
  const logo = report.institution?.logolink || global1.logo || "";

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ "@media print": { display: "none" } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>User Pivot Count</Typography>
            <Typography variant="body2" color="text.secondary">Select user fields and generate value-wise total counts.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
            <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6">Pivot Fields</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Add />} onClick={addField}>Add Field</Button>
              <Button variant="contained" startIcon={<Search />} onClick={() => generateReport()}>Generate</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={resetFields}>Reset</Button>
            </Stack>
          </Stack>
          <Grid container spacing={1.5}>
            {selectedFields.map((field, index) => (
              <React.Fragment key={`${field}-${index}`}>
                <Grid item xs={12} md={10}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Field</InputLabel>
                    <Select label="Field" value={field} onChange={(event) => updateField(index, event.target.value)}>
                      {fields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <IconButton color="error" onClick={() => removeField(index)} disabled={selectedFields.length === 1}>
                    <Delete />
                  </IconButton>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip color="primary" label={`Total Users: ${report.total}`} />
          <Chip label={`Selected Fields: ${cleanFields().map(fieldLabel).join(", ")}`} />
          <Chip label={`Pivot Rows: ${report.pivotRows.length}`} />
        </Stack>
      </Paper>

      <Box sx={{ bgcolor: "white", color: "#111827", p: 2, "@media print": { p: 0 } }}>
        <Stack alignItems="center" spacing={0.5} sx={{ mb: 2, textAlign: "center" }}>
          {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 72, height: 72, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={800}>{institutionName}</Typography>
          <Typography variant="body2" sx={{ maxWidth: 760 }}>{report.institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 1 }}>User Pivot Count</Typography>
        </Stack>

        <Paper sx={{ p: 1, overflowX: "auto", "@media print": { boxShadow: "none", border: "1px solid #cbd5e1" } }}>
          <DataGrid
            rows={report.pivotRows}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "user_pivot_count" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            sx={{
              minWidth: 720,
              "@media print": {
                ".MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer": { display: "none" },
                border: "none"
              }
            }}
          />
        </Paper>

        <Grid container spacing={3} sx={{ mt: 3, "@media print": { mt: 5 } }}>
          <Grid item xs={6}><Typography variant="body2">Checked by: ____________________</Typography></Grid>
          <Grid item xs={6}><Typography variant="body2">Approved by: ____________________</Typography></Grid>
        </Grid>
      </Box>
    </Container>
  );
}
