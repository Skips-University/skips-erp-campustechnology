import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Refresh, Search } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const academicYearOptions = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const categoryOptions = ["General", "SC", "ST", "EWS", "PH"];
const decisionStatuses = ["Selected", "Rejected"];

const MeritListSelectionPage = () => {
  const colid = useMemo(() => global1.colid, []);
  const [academicyear, setAcademicyear] = useState("2026-27");
  const [category, setCategory] = useState("General");
  const [programname, setProgramname] = useState("");
  const [programOptions, setProgramOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAppliedMeritList = async () => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/meritlist/applied", {
        params: { colid, academicyear, category, programname }
      });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading applied merit list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppliedMeritList();
  }, [colid]);

  const loadProgramOptions = async () => {
    if (!colid) {
      return;
    }

    try {
      const res = await ep1.get("/api/v2/meritlist", {
        params: { colid, academicyear, category }
      });
      const programs = [...new Set((res.data.data || []).map((row) => row.programname).filter(Boolean))].sort();
      setProgramOptions(programs);
      if (programname && !programs.includes(programname)) {
        setProgramname("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error loading program names");
    }
  };

  useEffect(() => {
    loadProgramOptions();
  }, [colid, academicyear, category]);

  const changeStatus = async (row, status) => {
    if (!status) {
      return;
    }

    setUpdatingId(row._id);
    setError("");
    try {
      await ep1.post("/api/v2/meritlist/status", { id: row._id, status });
      setMessage(`${row.student || "Student"} marked as ${status}`);
      await loadAppliedMeritList();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating status");
    } finally {
      setUpdatingId("");
    }
  };

  const columns = [
    {
      field: "rank",
      headerName: "Rank",
      width: 80,
      valueGetter: (params) => {
        const index = rows.findIndex((row) => row._id === params.row._id);
        return index + 1;
      }
    },
    { field: "student", headerName: "Student", minWidth: 170, flex: 1 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "email", headerName: "Email", minWidth: 190, flex: 1 },
    { field: "category", headerName: "Category", width: 120 },
    { field: "academicyear", headerName: "Academic Year", width: 135 },
    { field: "programname", headerName: "Program", minWidth: 150, flex: 1 },
    { field: "subjects", headerName: "Subjects", minWidth: 170, flex: 1 },
    { field: "externaltheorymarks", headerName: "External Marks", width: 145, type: "number" },
    { field: "sscaggregatemarks", headerName: "Qualifying Marks", width: 155, type: "number" },
    { field: "englishmarks", headerName: "English Marks", width: 135, type: "number" },
    { field: "tenthmarks", headerName: "Tenth Marks", width: 130, type: "number" },
    { field: "age", headerName: "Age", width: 90, type: "number" },
    { field: "bridgecourserequired", headerName: "Bridge Course", width: 145 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "decision",
      headerName: "Change Status",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <FormControl fullWidth size="small" disabled={updatingId === params.row._id}>
          <InputLabel>Set</InputLabel>
          <Select
            label="Set"
            value=""
            onChange={(event) => changeStatus(params.row, event.target.value)}
          >
            {decisionStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Merit List Selection
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Applied students sorted by external marks, qualifying marks, English marks, tenth marks, and age
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`Col ID: ${colid || "Not set"}`} color={colid ? "primary" : "warning"} variant="outlined" />
          <Chip label={`${rows.length} applied records`} variant="outlined" />
        </Stack>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Academic Year</InputLabel>
            <Select
              label="Academic Year"
              value={academicyear}
              onChange={(event) => setAcademicyear(event.target.value)}
            >
              {academicYearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categoryOptions.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Program Name</InputLabel>
            <Select
              label="Program Name"
              value={programname}
              onChange={(event) => setProgramname(event.target.value)}
            >
              <MenuItem value="">All Programs</MenuItem>
              {programOptions.map((program) => (
                <MenuItem key={program} value={program}>
                  {program}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" startIcon={<Search />} onClick={loadAppliedMeritList}>
            Load
          </Button>
          <Tooltip title="Reload applied list">
            <IconButton color="primary" onClick={loadAppliedMeritList}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ height: 650, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } }
            }}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                csvOptions: { fileName: `meritlist-${academicyear}-${category}` },
                printOptions: { disableToolbarButton: false }
              }
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default MeritListSelectionPage;
