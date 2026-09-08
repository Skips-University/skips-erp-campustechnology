import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Add, Close, FilterAlt, Save } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const filterFields = [
  "role",
  "department",
  "academicyear",
  "program",
  "programcode",
  "semester",
  "section",
  "designation",
  "name",
  "email",
  "phone",
  "regno",
  "status"
];

const labels = {
  role: "Role",
  department: "Department",
  academicyear: "Academic year",
  program: "Program",
  programcode: "Program code",
  semester: "Semester",
  section: "Section",
  designation: "Designation",
  name: "Name",
  email: "Email",
  phone: "Phone",
  regno: "Regno",
  status: "Status"
};

const uniqueSorted = (values = []) => [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const dateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

export default function UserEditJoiningDatePage() {
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ field: "role", value: "" }]);
  const [rows, setRows] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [joiningDate, setJoiningDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadOptions(); }, []);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/user-joining-date/options", { params: { colid: global1.colid } });
      setOptions(res.data?.data || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options");
    }
  };

  const optionValues = useMemo(() => {
    const mapped = {};
    filterFields.forEach((field) => {
      mapped[field] = uniqueSorted(options[field] || []);
    });
    mapped.status = ["1", "0", ...mapped.status.filter((value) => !["1", "0"].includes(String(value)))];
    return mapped;
  }, [options]);

  const updateFilter = (index, patch) => {
    setFilters((items) => items.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const addFilter = () => {
    const used = new Set(filters.map((item) => item.field));
    const nextField = filterFields.find((field) => !used.has(field)) || "name";
    setFilters((items) => [...items, { field: nextField, value: "" }]);
  };

  const removeFilter = (index) => {
    setFilters((items) => items.filter((_, idx) => idx !== index));
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const params = { colid: global1.colid };
      filters.forEach((filter) => {
        if (filter.field && String(filter.value || "").trim()) params[filter.field] = filter.value;
      });
      const res = await ep1.get("/api/v2/user-joining-date", { params });
      setRows(res.data?.data || []);
      setSelectedUser(null);
      setJoiningDate("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (row) => {
    setSelectedUser(row);
    setJoiningDate(dateInput(row.joiningdate));
  };

  const saveJoiningDate = async () => {
    try {
      if (!selectedUser?._id) {
        setError("Select a user first");
        return;
      }
      setError("");
      setMessage("");
      await ep1.post("/api/v2/user-joining-date/update", {
        id: selectedUser._id,
        joiningdate: joiningDate,
        colid: global1.colid,
        user: global1.user
      });
      setMessage("Joining date updated");
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update joining date");
    }
  };

  const columns = [
    { field: "name", headerName: "Name", width: 180 },
    { field: "email", headerName: "Email", width: 230 },
    { field: "role", headerName: "Role", width: 140 },
    { field: "department", headerName: "Department", width: 160 },
    { field: "designation", headerName: "Designation", width: 170 },
    { field: "academicyear", headerName: "Academic year", width: 140 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "section", headerName: "Section", width: 110 },
    { field: "regno", headerName: "Regno/Empid", width: 150 },
    { field: "joiningdate", headerName: "Joining date", width: 140, valueGetter: (params) => dateInput(params.row.joiningdate) },
    {
      field: "actions",
      type: "actions",
      width: 90,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Save />} label="Select" onClick={() => selectUser(row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Edit joining date">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Edit joining date</Typography>
            <Typography variant="body2" color="text.secondary">Filter users, select one record, and update only the joining date used by HR leave rules.</Typography>
          </Box>
          {selectedUser && <Chip color="primary" label={`Selected: ${selectedUser.name || selectedUser.email}`} />}
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {filters.map((filter, index) => (
              <React.Fragment key={`${filter.field}-${index}`}>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Field"
                    value={filter.field}
                    onChange={(event) => updateFilter(index, { field: event.target.value, value: "" })}
                  >
                    {filterFields.map((field) => <MenuItem key={field} value={field}>{labels[field]}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={10} md={4}>
                  {optionValues[filter.field]?.length && !["name", "email", "phone", "regno"].includes(filter.field) ? (
                    <Autocomplete
                      freeSolo
                      options={optionValues[filter.field]}
                      value={filter.value || ""}
                      onInputChange={(_, value) => updateFilter(index, { value })}
                      onChange={(_, value) => updateFilter(index, { value: value || "" })}
                      renderInput={(params) => <TextField {...params} size="small" label={labels[filter.field]} />}
                    />
                  ) : (
                    <TextField fullWidth size="small" label={labels[filter.field]} value={filter.value} onChange={(event) => updateFilter(index, { value: event.target.value })} />
                  )}
                </Grid>
                <Grid item xs={2} md={1}>
                  <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1}><Close /></IconButton>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button startIcon={<Add />} onClick={addFilter} variant="outlined">Add filter</Button>
                <Button startIcon={<FilterAlt />} onClick={loadUsers} variant="contained">Apply</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField fullWidth size="small" label="Selected user" value={selectedUser ? `${selectedUser.name || ""} ${selectedUser.email ? `(${selectedUser.email})` : ""}` : ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" type="date" label="Joining date" value={joiningDate} onChange={(event) => setJoiningDate(event.target.value)} InputLabelProps={{ shrink: true }} disabled={!selectedUser} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" startIcon={<Save />} onClick={saveJoiningDate} disabled={!selectedUser}>Save date</Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <DataGrid
            rows={rows}
            getRowId={(row) => row._id}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[25, 50, 100]}
            onRowDoubleClick={(params) => selectUser(params.row)}
          />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
