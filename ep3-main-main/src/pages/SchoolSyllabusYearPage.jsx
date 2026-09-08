import React, { useEffect, useMemo, useState } from "react";
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
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Cancel, Delete, Edit, Refresh, Save, Search } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = {
  regulation: "",
  description: "",
  isactive: "Yes"
};

const SchoolSyllabusYearPage = () => {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRegulations = async () => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/regulationmaster", {
        params: { colid, search, isactive: activeFilter }
      });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading syllabus years");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegulations();
  }, [colid]);

  const updateFormValue = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const saveRegulation = async (event) => {
    event.preventDefault();
    if (!colid) {
      setError("College id is not available.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = { ...form, colid };
      if (editingId) {
        await ep1.post("/api/v2/regulationmaster/update", { ...payload, id: editingId });
        setMessage("Syllabus year updated");
      } else {
        await ep1.post("/api/v2/regulationmaster", payload);
        setMessage("Syllabus year created");
      }
      resetForm();
      await loadRegulations();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving syllabus year");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      regulation: row.regulation || "",
      description: row.description || "",
      isactive: row.isactive || "Yes"
    });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete syllabus year ${row.regulation || ""}?`)) {
      return;
    }

    setError("");
    try {
      await ep1.post("/api/v2/regulationmaster/delete", { id: row._id });
      setMessage("Syllabus year deleted");
      await loadRegulations();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting syllabus year");
    }
  };

  const columns = [
    { field: "regulation", headerName: "Syllabus year", minWidth: 180, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 260, flex: 2 },
    { field: "isactive", headerName: "Is Active", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton color="primary" size="small" onClick={() => editRow(params.row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" size="small" onClick={() => deleteRow(params.row)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Syllabus year">
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Syllabus Year
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage syllabus years for the selected institution
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>
            Dashboard
          </Button>
          <Chip label={`Col ID: ${colid || "Not set"}`} color={colid ? "primary" : "warning"} variant="outlined" />
          <Chip label={`${rows.length} records`} variant="outlined" />
        </Stack>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6">{editingId ? "Edit Syllabus Year" : "Add Syllabus Year"}</Typography>
              {editingId && (
                <Tooltip title="Cancel edit">
                  <IconButton onClick={resetForm}>
                    <Cancel />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            <Box component="form" onSubmit={saveRegulation}>
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  name="regulation"
                  label="Syllabus year"
                  value={form.regulation}
                  onChange={updateFormValue}
                  required
                />
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={4}
                  name="description"
                  label="Description"
                  value={form.description}
                  onChange={updateFormValue}
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Is Active</InputLabel>
                  <Select
                    name="isactive"
                    label="Is Active"
                    value={form.isactive}
                    onChange={updateFormValue}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>

                <Stack direction="row" spacing={1}>
                  <Button type="submit" variant="contained" startIcon={editingId ? <Save /> : <Add />} disabled={saving}>
                    {editingId ? "Update" : "Create"}
                  </Button>
                  <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>
                    Clear
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Is Active</InputLabel>
                <Select
                  label="Is Active"
                  value={activeFilter}
                  onChange={(event) => setActiveFilter(event.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" startIcon={<Search />} onClick={loadRegulations}>
                Filter
              </Button>
              <Tooltip title="Reload">
                <IconButton color="primary" onClick={loadRegulations}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Stack>

            <Box sx={{ height: 620, width: "100%" }}>
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
                    csvOptions: { fileName: "syllabus_years" },
                    printOptions: { disableToolbarButton: false }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
    </MenuPageShell>
  );
};

export default SchoolSyllabusYearPage;
