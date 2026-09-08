import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
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
import PrintIcon from "@mui/icons-material/Print";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import MenuPageShell from "./MenuPageShell";
import NepLmsAttendancePage from "./NepLmsAttendancePage";
import ep1 from "../api/ep1";
import global1 from "./global1";

const configFields = ["role", "activity", "points", "status"];
const labels = { role: "Role", activity: "Activity", points: "Points", status: "Status" };
const blankConfig = { role: "", activity: "Attendance", points: 0, status: "Active" };
const reportFields = ["academicyear", "role", "activity", "user", "useremail", "date", "source"];
const reportLabels = { academicyear: "Academic Year", useremail: "User Email", source: "Source" };
const colors = ["#1565c0", "#2e7d32", "#ef6c00", "#7b1fa2", "#00838f", "#c62828", "#6d4c41"];
const readSheet = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
};
const text = (value) => String(value ?? "").trim();
const uniqueSorted = (values = []) => [...new Set(values.map(text).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const makeReportFilter = () => ({ id: `${Date.now()}-${Math.random()}`, field: "activity", value: "" });
const labelFor = (field) => reportLabels[field] || labels[field] || field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
const groupPoints = (rows = [], field) => Object.values(rows.reduce((acc, row) => {
  const key = text(row[field]) || "Not specified";
  if (!acc[key]) acc[key] = { name: key, count: 0, points: 0 };
  acc[key].count += 1;
  acc[key].points += Number(row.points || 0);
  return acc;
}, {})).sort((a, b) => b.points - a.points);

export function ActivityPointsConfigurationPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankConfig);
  const [selected, setSelected] = useState([]);
  const [options, setOptions] = useState({ roles: [], activities: [] });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await ep1.get("/api/v2/activity-monitoring/points-config", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load point configuration");
    }
  };
  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/activity-monitoring/points-config-options", { params: { colid: global1.colid } });
      setOptions(res.data || { roles: [], activities: [] });
    } catch (err) {
      setOptions({ roles: [], activities: [] });
    }
  };
  useEffect(() => { load(); loadOptions(); }, []);

  const save = async () => {
    try {
      setError("");
      await ep1.post("/api/v2/activity-monitoring/points-config", { ...form, colid: global1.colid, user: global1.user, name: global1.name });
      setForm(blankConfig);
      setMessage("Activity points configuration saved");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save configuration");
    }
  };

  const remove = async (ids) => {
    try {
      await ep1.post("/api/v2/activity-monitoring/points-config-delete", { ids });
      setSelected([]);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete configuration");
    }
  };

  const bulkUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const sheetRows = await readSheet(file);
      await ep1.post("/api/v2/activity-monitoring/points-config-bulk", { rows: sheetRows, colid: global1.colid, user: global1.user });
      setMessage("Bulk upload completed");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    } finally {
      event.target.value = "";
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([blankConfig]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ActivityPoints");
    XLSX.writeFile(wb, "activity_points_template.xlsx");
  };

  const columns = [
    ...configFields.map((field) => ({ field, headerName: labels[field], minWidth: field === "activity" ? 180 : 130, flex: field === "activity" ? 1 : 0 })),
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove([params.row._id])} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Activity points configuration">
      <Stack spacing={2}>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Autocomplete
                freeSolo
                options={options.roles || []}
                value={form.role || ""}
                onInputChange={(event, value) => setForm({ ...form, role: value || "" })}
                onChange={(event, value) => setForm({ ...form, role: value || "" })}
                renderInput={(params) => <TextField {...params} label="Role" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                freeSolo
                options={["Attendance", ...(options.activities || []).filter((item) => item !== "Attendance")]}
                value={form.activity || ""}
                onInputChange={(event, value) => setForm({ ...form, activity: value || "" })}
                onChange={(event, value) => setForm({ ...form, activity: value || "" })}
                renderInput={(params) => <TextField {...params} label="Activity" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={2}><TextField label="Points" type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} fullWidth /></Grid>
            <Grid item xs={12} md={2}>
              <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}><Button variant="contained" startIcon={<SaveIcon />} onClick={save} fullWidth sx={{ height: 56 }}>Save</Button></Grid>
          </Grid>
        </Paper>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>
          <Button onClick={downloadTemplate}>Download template</Button>
          <Button component="label" startIcon={<UploadFileIcon />}>Bulk upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={bulkUpload} /></Button>
          <Button color="error" startIcon={<DeleteIcon />} disabled={!selected.length} onClick={() => remove(selected)}>Bulk delete</Button>
        </Stack>
        <Paper sx={{ height: 520 }}>
          <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} checkboxSelection onRowSelectionModelChange={setSelected} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
        </Paper>
      </Stack>
    </MenuPageShell>
  );
}

export function ActivityUserPointsPage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", role: "", activity: "", user: "", useremail: "", date: "" });
  const [error, setError] = useState("");
  const total = useMemo(() => rows.reduce((sum, row) => sum + Number(row.points || 0), 0), [rows]);
  const load = async () => {
    try {
      const res = await ep1.get("/api/v2/activity-monitoring/user-points", { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load user points");
    }
  };
  useEffect(() => { load(); }, []);
  const columns = ["academicyear", "user", "useremail", "role", "activity", "date", "points", "source"].map((field) => ({
    field,
    headerName: field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase()),
    minWidth: field === "useremail" ? 220 : 140,
    flex: ["user", "activity"].includes(field) ? 1 : 0
  }));
  return (
    <MenuPageShell title="User points">
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {Object.keys(filters).map((field) => (
              <Grid item xs={12} md={2} key={field}>
                <TextField label={field} value={filters[field]} type={field === "date" ? "date" : "text"} InputLabelProps={field === "date" ? { shrink: true } : undefined} onChange={(e) => setFilters({ ...filters, [field]: e.target.value })} fullWidth />
              </Grid>
            ))}
            <Grid item xs={12} md={2}><Button variant="contained" onClick={load} fullWidth sx={{ height: 56 }}>Apply</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}><Typography variant="h6">Total points: {total}</Typography></Paper>
        <Paper sx={{ height: 560 }}>
          <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
        </Paper>
      </Stack>
    </MenuPageShell>
  );
}

export function ActivityMonitoringReportPage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([makeReportFilter()]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await ep1.get("/api/v2/activity-monitoring/user-points", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load activity report");
    }
  };
  useEffect(() => { load(); }, []);

  const filteredRows = useMemo(() => rows.filter((row) => filters.every((filter) => {
    if (!filter.value) return true;
    return text(row[filter.field]).toLowerCase().includes(text(filter.value).toLowerCase());
  })), [rows, filters]);
  const totalPoints = filteredRows.reduce((sum, row) => sum + Number(row.points || 0), 0);
  const totalUsers = new Set(filteredRows.map((row) => text(row.useremail)).filter(Boolean)).size;
  const totalActivities = new Set(filteredRows.map((row) => text(row.activity)).filter(Boolean)).size;
  const byActivity = groupPoints(filteredRows, "activity");
  const byRole = groupPoints(filteredRows, "role");
  const byDate = groupPoints(filteredRows, "date").sort((a, b) => a.name.localeCompare(b.name));
  const valueOptions = (field) => uniqueSorted(rows.map((row) => row[field]));
  const columns = ["academicyear", "user", "useremail", "role", "activity", "date", "points", "source"].map((field) => ({
    field,
    headerName: labelFor(field),
    minWidth: field === "useremail" ? 220 : 140,
    flex: ["user", "activity"].includes(field) ? 1 : 0
  }));
  const cardData = [
    ["Records", filteredRows.length, "#e3f2fd"],
    ["Users", totalUsers, "#e8f5e9"],
    ["Activities", totalActivities, "#fff3e0"],
    ["Total points", totalPoints, "#f3e5f5"]
  ];

  return (
    <MenuPageShell title="Activity monitoring report">
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <Paper sx={{ p: 2 }} className="no-print">
          <Stack spacing={2}>
            <Grid container spacing={2}>
              {filters.map((filter, index) => (
                <React.Fragment key={filter.id}>
                  <Grid item xs={12} md={3}>
                    <Autocomplete
                      options={reportFields}
                      value={filter.field}
                      getOptionLabel={labelFor}
                      onChange={(event, value) => {
                        const next = [...filters];
                        next[index] = { ...filter, field: value || "activity", value: "" };
                        setFilters(next);
                      }}
                      renderInput={(params) => <TextField {...params} label="Field" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Autocomplete
                      freeSolo
                      options={valueOptions(filter.field)}
                      value={filter.value}
                      onInputChange={(event, value) => {
                        const next = [...filters];
                        next[index] = { ...filter, value: value || "" };
                        setFilters(next);
                      }}
                      onChange={(event, value) => {
                        const next = [...filters];
                        next[index] = { ...filter, value: value || "" };
                        setFilters(next);
                      }}
                      renderInput={(params) => <TextField {...params} label="Value" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button color="error" disabled={filters.length === 1} onClick={() => setFilters(filters.filter((item) => item.id !== filter.id))} fullWidth sx={{ height: 56 }}>Remove</Button>
                  </Grid>
                </React.Fragment>
              ))}
              <Grid item xs={12} md={2}>
                <Button variant="contained" onClick={() => setFilters([...filters, makeReportFilter()])} fullWidth sx={{ height: 56 }}>Add filter</Button>
              </Grid>
            </Grid>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>
              <Button startIcon={<PrintIcon />} variant="outlined" onClick={() => window.print()}>Print preview</Button>
            </Stack>
          </Stack>
        </Paper>

        <Box id="activity-monitoring-print" sx={{ "@media print": { p: 1, color: "#000" } }}>
          <Typography variant="h6" fontWeight={800} gutterBottom>Activity monitoring report</Typography>
          <Grid container spacing={2}>
            {cardData.map(([title, value, color]) => (
              <Grid item xs={12} md={3} key={title}>
                <Card sx={{ bgcolor: color, borderRadius: 2 }}>
                  <CardContent>
                    <Typography color="text.secondary">{title}</Typography>
                    <Typography variant="h4" fontWeight={800}>{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2, height: 320 }}>
                <Typography fontWeight={700}>Activity-wise points</Typography>
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={byActivity.slice(0, 12)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="points" fill="#1565c0" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2, height: 320 }}>
                <Typography fontWeight={700}>Role-wise points</Typography>
                <ResponsiveContainer width="100%" height="88%">
                  <PieChart>
                    <Pie data={byRole} dataKey="points" nameKey="name" outerRadius={95} label>
                      {byRole.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography fontWeight={700}>Date-wise trend</Typography>
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={byDate.slice(-20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="points" fill="#2e7d32" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
          <Paper sx={{ p: 2, mt: 2, overflowX: "auto" }}>
            <Typography fontWeight={700} gutterBottom>Details</Typography>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <Box component="thead">
                <Box component="tr">
                  {columns.map((column) => (
                    <Box component="th" key={column.field} sx={{ border: "1px solid #ddd", p: 0.7, textAlign: "left" }}>{column.headerName}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {filteredRows.slice(0, 500).map((row) => (
                  <Box component="tr" key={row._id}>
                    {columns.map((column) => (
                      <Box component="td" key={column.field} sx={{ border: "1px solid #ddd", p: 0.7 }}>{text(row[column.field])}</Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>
        <Paper sx={{ height: 560 }} className="no-print">
          <DataGrid rows={filteredRows.map((row) => ({ ...row, id: row._id }))} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
        </Paper>
      </Stack>
    </MenuPageShell>
  );
}

export function ActivityMonitoringReport2Page() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({ roles: [], activities: [], years: [], userOptions: [] });
  const [institution, setInstitution] = useState(null);
  const [dateRange, setDateRange] = useState({ fromdate: "", todate: "" });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filters, setFilters] = useState([makeReportFilter()]);
  const [error, setError] = useState("");

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/activity-monitoring/user-points-options", { params: { colid: global1.colid } });
      setOptions(res.data || { roles: [], activities: [], years: [], userOptions: [] });
    } catch (err) {
      setOptions({ roles: [], activities: [], years: [], userOptions: [] });
    }
  };

  const load = async () => {
    try {
      setError("");
      const params = {
        colid: global1.colid,
        fromdate: dateRange.fromdate,
        todate: dateRange.todate,
        useremails: selectedUsers.map((user) => user.email).filter(Boolean).join(",")
      };
      const res = await ep1.get("/api/v2/activity-monitoring/user-points", { params });
      setRows(res.data?.data || []);
      setInstitution(res.data?.institution || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load activity report");
    }
  };

  useEffect(() => { loadOptions(); load(); }, []);

  const filteredRows = useMemo(() => rows.filter((row) => filters.every((filter) => {
    if (!filter.value) return true;
    return text(row[filter.field]).toLowerCase().includes(text(filter.value).toLowerCase());
  })), [rows, filters]);

  const totalPoints = filteredRows.reduce((sum, row) => sum + Number(row.points || 0), 0);
  const totalUsers = new Set(filteredRows.map((row) => text(row.useremail)).filter(Boolean)).size;
  const totalActivities = new Set(filteredRows.map((row) => text(row.activity)).filter(Boolean)).size;
  const byActivity = groupPoints(filteredRows, "activity");
  const byUser = groupPoints(filteredRows, "user");
  const byDate = groupPoints(filteredRows, "date").sort((a, b) => a.name.localeCompare(b.name));
  const valueOptions = (field) => uniqueSorted(rows.map((row) => row[field]));
  const columns = ["academicyear", "user", "useremail", "role", "activity", "date", "points", "source", "status"].map((field) => ({
    field,
    headerName: labelFor(field),
    minWidth: field === "useremail" ? 220 : 140,
    flex: ["user", "activity", "source"].includes(field) ? 1 : 0
  }));
  const cardData = [
    ["Records", filteredRows.length, "#e3f2fd"],
    ["Users", totalUsers, "#e8f5e9"],
    ["Activities", totalActivities, "#fff3e0"],
    ["Activity point", totalPoints, "#f3e5f5"]
  ];
  const institutionName = institution?.institutionname || global1.insname || global1.institution || "Institution";
  const logo = institution?.logolink || global1.logo || "";
  const address = institution?.address || institution?.contactusdetails || "";

  return (
    <MenuPageShell title="Activity report 2">
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <Paper sx={{ p: 2 }} className="no-print">
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2.5}>
                <TextField label="From date" type="date" value={dateRange.fromdate} onChange={(e) => setDateRange({ ...dateRange, fromdate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField label="To date" type="date" value={dateRange.todate} onChange={(e) => setDateRange({ ...dateRange, todate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
              </Grid>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={options.userOptions || []}
                  value={selectedUsers}
                  getOptionLabel={(option) => `${option.name || option.email}${option.email ? ` (${option.email})` : ""}`}
                  isOptionEqualToValue={(option, value) => option.email === value.email}
                  onChange={(event, value) => setSelectedUsers(value)}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox checked={selected} sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2">{option.name || option.email}</Typography>
                        <Typography variant="caption" color="text.secondary">{option.email}{option.role ? ` | ${option.role}` : ""}</Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => <TextField {...params} label="Select users" placeholder="Search name or email" />}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="contained" onClick={load} fullWidth sx={{ height: 56 }}>Apply</Button>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              {filters.map((filter, index) => (
                <React.Fragment key={filter.id}>
                  <Grid item xs={12} md={3}>
                    <Autocomplete
                      options={reportFields}
                      value={filter.field}
                      getOptionLabel={labelFor}
                      onChange={(event, value) => {
                        const next = [...filters];
                        next[index] = { ...filter, field: value || "activity", value: "" };
                        setFilters(next);
                      }}
                      renderInput={(params) => <TextField {...params} label="Filter field" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Autocomplete
                      freeSolo
                      options={valueOptions(filter.field)}
                      value={filter.value}
                      onInputChange={(event, value) => {
                        const next = [...filters];
                        next[index] = { ...filter, value: value || "" };
                        setFilters(next);
                      }}
                      onChange={(event, value) => {
                        const next = [...filters];
                        next[index] = { ...filter, value: value || "" };
                        setFilters(next);
                      }}
                      renderInput={(params) => <TextField {...params} label="Filter value" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button color="error" disabled={filters.length === 1} onClick={() => setFilters(filters.filter((item) => item.id !== filter.id))} fullWidth sx={{ height: 56 }}>Remove</Button>
                  </Grid>
                </React.Fragment>
              ))}
              <Grid item xs={12} md={2}>
                <Button variant="outlined" onClick={() => setFilters([...filters, makeReportFilter()])} fullWidth sx={{ height: 56 }}>Add filter</Button>
              </Grid>
            </Grid>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<RefreshIcon />} onClick={() => { loadOptions(); load(); }}>Refresh</Button>
              <Button startIcon={<PrintIcon />} variant="outlined" onClick={() => window.print()}>Print preview</Button>
            </Stack>
          </Stack>
        </Paper>

        <Box id="activity-report-2-print" sx={{ "@media print": { p: 1, color: "#000" } }}>
          <Paper sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 2, border: "1px solid #e0e0e0" }}>
            {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 70, height: 70, objectFit: "contain" }} />}
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography variant="h6" fontWeight={900}>{institutionName}</Typography>
              <Typography variant="body2">{address}</Typography>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 1 }}>Activity Report 2</Typography>
              {(dateRange.fromdate || dateRange.todate) && <Typography variant="caption">Period: {dateRange.fromdate || "Start"} to {dateRange.todate || "End"}</Typography>}
            </Box>
          </Paper>
          <Grid container spacing={2}>
            {cardData.map(([title, value, color]) => (
              <Grid item xs={12} md={3} key={title}>
                <Card sx={{ bgcolor: color, borderRadius: 2 }}>
                  <CardContent>
                    <Typography color="text.secondary">{title}</Typography>
                    <Typography variant="h4" fontWeight={800}>{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 320 }}>
                <Typography fontWeight={700}>Activity-wise points</Typography>
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={byActivity.slice(0, 12)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="points" fill="#1565c0" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 320 }}>
                <Typography fontWeight={700}>User-wise points</Typography>
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={byUser.slice(0, 12)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="points" fill="#2e7d32" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 280 }}>
                <Typography fontWeight={700}>Date-wise points</Typography>
                <ResponsiveContainer width="100%" height="86%">
                  <BarChart data={byDate.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="points" fill="#7b1fa2" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
          <Paper sx={{ p: 2, mt: 2, overflowX: "auto" }}>
            <Typography fontWeight={700} gutterBottom>Details</Typography>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <Box component="thead">
                <Box component="tr">
                  {columns.map((column) => <Box component="th" key={column.field} sx={{ border: "1px solid #ddd", p: 0.7, textAlign: "left" }}>{column.headerName}</Box>)}
                </Box>
              </Box>
              <Box component="tbody">
                {filteredRows.slice(0, 800).map((row) => (
                  <Box component="tr" key={row._id}>
                    {columns.map((column) => <Box component="td" key={column.field} sx={{ border: "1px solid #ddd", p: 0.7 }}>{text(row[column.field])}</Box>)}
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>
        <Paper sx={{ height: 560 }} className="no-print">
          <DataGrid rows={filteredRows.map((row) => ({ ...row, id: row._id }))} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
        </Paper>
      </Stack>
    </MenuPageShell>
  );
}

export function NepLmsAttendanceEventPage() {
  return <NepLmsAttendancePage pageTitle="Attendance event" raiseActivityEvent />;
}
