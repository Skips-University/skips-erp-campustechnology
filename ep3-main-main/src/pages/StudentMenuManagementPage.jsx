import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import MenuPageShell from "./MenuPageShell";
import { studentDefaultMenuGroups, studentMenuFlatItems } from "./studentMenuData";
import ep1 from "../api/ep1";
import global1 from "./global1";

const allMarker = { id: "__all__", label: "Select all" };
const emptyEdit = { id: "", groupname: "", title: "", order: 0, status1: "Active", comments: "" };

export default function StudentMenuManagementPage() {
  const [options, setOptions] = useState({ years: [], programs: [] });
  const [rows, setRows] = useState([]);
  const [academicyear, setAcademicyear] = useState("2026-27");
  const [program, setProgram] = useState(null);
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [groupname, setGroupname] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [edit, setEdit] = useState(emptyEdit);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const groupOptions = useMemo(() => studentDefaultMenuGroups.map((item) => ({ id: item.group, label: item.group })), []);
  const filteredItems = useMemo(() => {
    const selectedGroups = groups.map((item) => item.id);
    return studentMenuFlatItems.filter((item) => !selectedGroups.length || selectedGroups.includes(item.menugroup));
  }, [groups]);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/student-custom-menu/options", { params: { colid: global1.colid } });
      const years = res.data?.years || [];
      setOptions({ years, programs: res.data?.programs || [] });
      if (!academicyear && years.length) setAcademicyear(years[0]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load options");
    }
  };

  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/student-custom-menu", {
        params: { colid: global1.colid, academicyear, programcode: program?.programcode || "" }
      });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOptions(); }, []);
  useEffect(() => { loadRows(); }, [academicyear, program?.programcode]);

  const programsForYear = useMemo(() => {
    return (options.programs || []).filter((item) => !academicyear || item.academicyear === academicyear);
  }, [options.programs, academicyear]);

  const handleGroupChange = (value) => {
    if (value.some((item) => item.id === allMarker.id)) {
      setGroups(groups.length === groupOptions.length ? [] : groupOptions);
      setItems([]);
      return;
    }
    setGroups(value);
    setItems((prev) => prev.filter((item) => value.some((group) => group.id === item.menugroup)));
  };

  const handleItemChange = (value) => {
    if (value.some((item) => item.id === allMarker.id)) {
      setItems(items.length === filteredItems.length ? [] : filteredItems);
      return;
    }
    setItems(value);
  };

  const save = async () => {
    if (!academicyear || !program?.programcode || !items.length) {
      setError("Select academic year, program and at least one page");
      return;
    }
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await ep1.post("/api/v2/student-custom-menu", {
        colid: global1.colid,
        academicyear,
        program: program.program,
        programcode: program.programcode,
        groupname,
        user: global1.user,
        items
      });
      setMessage(`Menu saved. Added ${res.data?.inserted || 0}, skipped duplicates ${res.data?.skipped || 0}.`);
      setItems([]);
      setGroupname("");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save student menu");
    } finally {
      setSaving(false);
    }
  };

  const update = async () => {
    if (!edit.id) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/student-custom-menu-update", edit);
      setMessage("Menu item updated");
      setEdit(emptyEdit);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update menu item");
    } finally {
      setSaving(false);
    }
  };

  const deleteRows = async (ids) => {
    if (!ids.length) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/student-custom-menu-delete", { ids });
      setMessage("Selected menu item(s) deleted");
      setSelectedRows([]);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete menu item");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 130 },
    { field: "program", headerName: "Program", width: 220 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "menugroup", headerName: "Default Group", width: 180 },
    { field: "groupname", headerName: "Display Group", width: 180 },
    { field: "title", headerName: "Page", width: 220 },
    { field: "path", headerName: "Path", width: 240 },
    { field: "order", headerName: "Order", width: 90 },
    { field: "status1", headerName: "Status", width: 110 },
    {
      field: "actions",
      type: "actions",
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setEdit({ id: row._id, groupname: row.groupname || row.menugroup, title: row.title, order: row.order || 0, status1: row.status1 || "Active", comments: row.comments || "" })} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteRows([row._id])} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Student Menu Management">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Create student menu</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Academic Year" value={academicyear} onChange={(e) => { setAcademicyear(e.target.value); setProgram(null); }}>
                  {["2023-24", "2024-25", "2025-26", "2026-27", "2027-28", ...(options.years || [])].filter((v, i, a) => v && a.indexOf(v) === i).map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={programsForYear}
                  value={program}
                  onChange={(event, value) => setProgram(value)}
                  getOptionLabel={(option) => option ? `${option.program || ""} (${option.programcode || ""})` : ""}
                  renderInput={(params) => <TextField {...params} label="Program / Program Code" />}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField fullWidth label="Display group name (optional)" value={groupname} onChange={(e) => setGroupname(e.target.value)} helperText="If blank, default group name will be used." />
              </Grid>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={[allMarker, ...groupOptions]}
                  value={groups}
                  onChange={(event, value) => handleGroupChange(value)}
                  getOptionLabel={(option) => option.label}
                  renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={option.id === allMarker.id ? groups.length === groupOptions.length : selected} />{option.label}</li>}
                  renderInput={(params) => <TextField {...params} label="Groups" />}
                />
              </Grid>
              <Grid item xs={12} md={7}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={[allMarker, ...filteredItems]}
                  value={items}
                  onChange={(event, value) => handleItemChange(value)}
                  getOptionLabel={(option) => option.label || `${option.title || ""} - ${option.path || ""}`}
                  renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={option.id === allMarker.id ? items.length === filteredItems.length : selected} />{option.label || <Box><Typography>{option.title}</Typography><Typography variant="caption">{option.menugroup} - {option.path}</Typography></Box>}</li>}
                  renderTags={(value, getTagProps) => value.slice(0, 4).map((option, index) => <Chip size="small" label={option.title} {...getTagProps({ index })} />)}
                  renderInput={(params) => <TextField {...params} label="Pages" helperText={`${items.length} selected`} />}
                />
              </Grid>
              <Grid item xs={12}>
                <Button startIcon={<SaveIcon />} variant="contained" onClick={save} disabled={saving}>Add selected menu items</Button>
              </Grid>
            </Grid>
          </Paper>

          {edit.id && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Edit menu item</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}><TextField fullWidth label="Display Group" value={edit.groupname} onChange={(e) => setEdit((p) => ({ ...p, groupname: e.target.value }))} /></Grid>
                <Grid item xs={12} md={3}><TextField fullWidth label="Title" value={edit.title} onChange={(e) => setEdit((p) => ({ ...p, title: e.target.value }))} /></Grid>
                <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Order" value={edit.order} onChange={(e) => setEdit((p) => ({ ...p, order: e.target.value }))} /></Grid>
                <Grid item xs={12} md={2}><TextField select fullWidth label="Status" value={edit.status1} onChange={(e) => setEdit((p) => ({ ...p, status1: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
                <Grid item xs={12} md={2}><Button fullWidth sx={{ minHeight: 54 }} variant="contained" onClick={update} disabled={saving}>Update</Button></Grid>
              </Grid>
            </Paper>
          )}

          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={800}>Configured student menu</Typography>
              <Stack direction="row" spacing={1}>
                <Button startIcon={<RefreshIcon />} onClick={loadRows}>Refresh</Button>
                <Button startIcon={<DeleteIcon />} color="error" variant="outlined" disabled={!selectedRows.length || saving} onClick={() => deleteRows(selectedRows)}>Bulk delete</Button>
              </Stack>
            </Stack>
            <Box sx={{ height: 560, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                checkboxSelection
                rowSelectionModel={selectedRows}
                onRowSelectionModelChange={(model) => setSelectedRows(model)}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
                slots={{ toolbar: GridToolbar }}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
