import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import ep1 from "../api/ep1";
import global1 from "./global1";

const academicYears = ["", "2026-27", "2027-28", "2028-29"];

export default function DynamicAdmissionApplicationsPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    academicyear: "",
    programcode: "",
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    loadPrograms();
    loadApplications();
  }, []);

  const loadPrograms = async () => {
    const res = await ep1.get(`/admission-dynamic/programs?colid=${global1.colid}`);
    setPrograms(res.data || []);
  };

  const loadApplications = async (nextFilters = filters) => {
    const params = new URLSearchParams({ colid: global1.colid });
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const res = await ep1.get(`/admission-dynamic/applications?${params.toString()}`);
    setRows(res.data || []);
  };

  const programOptions = useMemo(() => programs.map((program) => ({
    label: `${program.program || program.name || ""} (${program.programcode || ""})`,
    programcode: program.programcode || ""
  })), [programs]);

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
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
    { field: "academicyear", headerName: "Academic Year", flex: 1 },
    { field: "name", headerName: "Name", flex: 1.4 },
    { field: "email", headerName: "Email", flex: 1.4 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "regno", headerName: "Reg No", flex: 1 },
    { field: "gender", headerName: "Gender", flex: 0.9 },
    { field: "category", headerName: "Category", flex: 0.8 },
    { field: "dateofbirth", headerName: "Date of Birth", flex: 1 },
    { field: "age", headerName: "Age", flex: 0.6 },
    { field: "externaltheorymarks", headerName: "External Theory", flex: 1 },
    { field: "englishmarks", headerName: "English", flex: 0.8 },
    { field: "programapplied", headerName: "Program", flex: 1.5 },
    { field: "programcode", headerName: "Program Code", flex: 1 },
    { field: "validationstatus", headerName: "Validation", flex: 0.9 },
    { field: "validationcomments", headerName: "Validation Comments", flex: 1.6 },
    { field: "applicationstatus", headerName: "Status", flex: 0.9 },
    {
      field: "profile",
      headerName: "Profile",
      flex: 0.8,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => navigate(`/dynamic-admission-profile/${params.row._id}`)}
        >
          View
        </Button>
      )
    },
    {
      field: "subjectProfile",
      headerName: "Subject View",
      flex: 1,
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
      field: "profile2",
      headerName: "Profile 2",
      flex: 0.9,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => navigate(`/dynamic-admission-profile2/${params.row._id}`)}
        >
          View
        </Button>
      )
    },
    {
      field: "delete",
      headerName: "Delete",
      flex: 0.8,
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
        <Typography variant="h5" fontWeight={700}>Admission Applications</Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => updateFilter("academicyear", e.target.value)}>
                {academicYears.map((year) => <MenuItem key={year || "all"} value={year}>{year || "All"}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Program" value={filters.programcode} onChange={(e) => updateFilter("programcode", e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {programOptions.map((program) => <MenuItem key={program.programcode || program.label} value={program.programcode}>{program.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Name" value={filters.name} onChange={(e) => updateFilter("name", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Email" value={filters.email} onChange={(e) => updateFilter("email", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Phone" value={filters.phone} onChange={(e) => updateFilter("phone", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button fullWidth variant="contained" onClick={() => loadApplications()} sx={{ height: 56 }}>
                Load
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Applications</Typography>
            <Typography color="text.secondary">{rows.length} records</Typography>
          </Stack>
          <Box sx={{ height: 560, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
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
