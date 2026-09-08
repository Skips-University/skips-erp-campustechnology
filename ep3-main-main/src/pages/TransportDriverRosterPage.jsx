import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Grid,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const emptyForm = {
  driverid: "",
  drivername: "",
  driveremail: "",
  vehicle: "",
  vehicleno: "",
  route: "",
  dutytype: "Regular",
  startdatetime: "",
  enddatetime: "",
  notes: "",
  status: "Scheduled"
};

const pad = (value) => String(value).padStart(2, "0");
const dateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toInputDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const dateLabel = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
};
const timeLabel = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getCalendarDays = (viewDate, viewMode) => {
  const date = new Date(viewDate);
  if (viewMode === "daily") return [new Date(date.getFullYear(), date.getMonth(), date.getDate())];
  if (viewMode === "weekly") {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
  }
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
};

function RosterCalendar({ rows, viewDate, viewMode }) {
  const days = getCalendarDays(viewDate, viewMode);
  const selectedMonth = new Date(viewDate).getMonth();
  const grouped = useMemo(() => rows.reduce((acc, row) => {
    const date = new Date(row.startdatetime);
    if (!Number.isNaN(date.getTime())) {
      const key = dateKey(date);
      acc[key] = acc[key] || [];
      acc[key].push(row);
    }
    return acc;
  }, {}), [rows]);

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${viewMode === "daily" ? 1 : 7}, minmax(${viewMode === "daily" ? 460 : 165}px, 1fr))`,
          gap: 1,
          minWidth: viewMode === "daily" ? 520 : 1160
        }}
      >
        {days.map((day) => {
          const key = dateKey(day);
          const dayRows = grouped[key] || [];
          const dimmed = viewMode === "monthly" && day.getMonth() !== selectedMonth;
          return (
            <Paper key={key} variant="outlined" sx={{ minHeight: viewMode === "daily" ? 360 : 145, p: 1, bgcolor: dimmed ? "#f8fafc" : "#fff" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography fontWeight={700} color={dimmed ? "text.secondary" : "text.primary"}>
                  {day.toLocaleDateString(undefined, { weekday: viewMode === "monthly" ? "short" : "long", day: "numeric", month: "short" })}
                </Typography>
                <Chip size="small" label={dayRows.length} color={dayRows.length ? "primary" : "default"} />
              </Stack>
              <Stack spacing={0.75}>
                {dayRows.map((row) => (
                  <Box key={row._id} sx={{ p: 1, borderRadius: 1.5, bgcolor: "#eef6ff", borderLeft: "4px solid #1976d2" }}>
                    <Typography variant="caption" fontWeight={700}>{timeLabel(row.startdatetime)} - {timeLabel(row.enddatetime)}</Typography>
                    <Typography variant="body2" fontWeight={700}>{row.drivername}</Typography>
                    <Typography variant="caption" display="block">{row.vehicleno || row.vehicle || "Vehicle not set"} {row.route ? `- ${row.route}` : ""}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.status}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

export default function TransportDriverRosterPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("monthly");
  const [viewDate, setViewDate] = useState(dateKey(new Date()));
  const [filterDriver, setFilterDriver] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/transport-driver-roster-options", { params: { colid: global1.colid } });
      setDrivers(res.data?.data?.drivers || []);
      setVehicles(res.data?.data?.vehicles || []);
      setRoutes(res.data?.data?.routes || []);
    } catch (err) {
      setDrivers([]);
      setVehicles([]);
      setRoutes([]);
    }
  };

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/transport-driver-roster", {
        params: {
          colid: global1.colid,
          driverid: filterDriver,
          vehicleno: filterVehicle,
          fromdate: fromDate,
          todate: toDate
        }
      });
      setRows(res.data?.data || []);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    loadRows();
  }, []);

  const setField = (field, value) => {
    setForm((prev) => {
      if (field === "driverid") {
        const driver = drivers.find((item) => item._id === value);
        return {
          ...prev,
          driverid: value,
          drivername: driver?.name || "",
          driveremail: driver?.email || "",
          vehicle: driver?.assignedvehicle || prev.vehicle,
          vehicleno: driver?.assignedvehicle || prev.vehicleno
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId("");
  };

  const saveRoster = async () => {
    if (!form.drivername || !form.startdatetime || !form.enddatetime) {
      setError("Driver, start date time and end date time are required.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/transport-driver-roster", {
        ...form,
        id: editId,
        colid: global1.colid,
        user: global1.user
      });
      setMessage(editId ? "Roster updated." : "Roster added.");
      resetForm();
      loadRows();
      loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save roster.");
    } finally {
      setSaving(false);
    }
  };

  const editRoster = (row) => {
    setEditId(row._id);
    setForm({
      driverid: row.driverid || "",
      drivername: row.drivername || "",
      driveremail: row.driveremail || "",
      vehicle: row.vehicle || "",
      vehicleno: row.vehicleno || "",
      route: row.route || "",
      dutytype: row.dutytype || "Regular",
      startdatetime: toInputDateTime(row.startdatetime),
      enddatetime: toInputDateTime(row.enddatetime),
      notes: row.notes || "",
      status: row.status || "Scheduled"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRoster = async (row) => {
    if (!window.confirm("Delete this roster entry?")) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/transport-driver-roster-delete", { id: row._id, colid: global1.colid });
      setMessage("Roster entry deleted.");
      if (editId === row._id) resetForm();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete roster entry.");
    } finally {
      setSaving(false);
    }
  };

  const filteredRows = useMemo(() => rows.filter((row) => (
    (!filterDriver || row.driverid === filterDriver) &&
    (!filterVehicle || row.vehicleno === filterVehicle)
  )), [rows, filterDriver, filterVehicle]);

  const columns = [
    { field: "drivername", headerName: "Driver", minWidth: 170, flex: 1 },
    { field: "driveremail", headerName: "Email", minWidth: 210, flex: 1 },
    { field: "vehicleno", headerName: "Vehicle", minWidth: 130 },
    { field: "route", headerName: "Route", minWidth: 150 },
    { field: "dutytype", headerName: "Duty type", minWidth: 130 },
    { field: "startdatetime", headerName: "Start", minWidth: 180, valueGetter: (params) => dateLabel(params.row.startdatetime) },
    { field: "enddatetime", headerName: "End", minWidth: 180, valueGetter: (params) => dateLabel(params.row.enddatetime) },
    { field: "status", headerName: "Status", minWidth: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editRoster(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteRoster(params.row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Driver Roster">
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component="button" underline="hover" onClick={() => navigate("/dashdashfacnew")}>Dashboard</Link>
          <Typography color="text.secondary">Transport</Typography>
          <Typography color="text.primary">Driver roster</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>Roster entry</Typography>
              <Typography variant="body2" color="text.secondary">Assign drivers to vehicles, routes and duty windows.</Typography>
            </Box>
            <Button variant="outlined" onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
          </Stack>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth required label="Driver" value={form.driverid} onChange={(e) => setField("driverid", e.target.value)}>
                {drivers.map((driver) => (
                  <MenuItem key={driver._id} value={driver._id}>{driver.name} {driver.email ? `(${driver.email})` : ""}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Vehicle" value={form.vehicleno} onChange={(e) => {
                setField("vehicleno", e.target.value);
                setField("vehicle", e.target.value);
              }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Route" value={form.route} onChange={(e) => setField("route", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Duty type" value={form.dutytype} onChange={(e) => setField("dutytype", e.target.value)}>
                {["Regular", "Special", "Night", "Emergency", "Maintenance"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                {["Scheduled", "Completed", "Cancelled"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth required type="datetime-local" label="Start date time" InputLabelProps={{ shrink: true }} value={form.startdatetime} onChange={(e) => setField("startdatetime", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth required type="datetime-local" label="End date time" InputLabelProps={{ shrink: true }} value={form.enddatetime} onChange={(e) => setField("enddatetime", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Notes" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={saveRoster}>
                  {editId ? "Update" : "Save"}
                </Button>
                <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={resetForm}>Reset</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Roster calendar</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="View" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="View date" InputLabelProps={{ shrink: true }} value={viewDate} onChange={(e) => setViewDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Driver filter" value={filterDriver} onChange={(e) => setFilterDriver(e.target.value)}>
                <MenuItem value="">All drivers</MenuItem>
                {drivers.map((driver) => <MenuItem key={driver._id} value={driver._id}>{driver.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Vehicle filter" value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}>
                <MenuItem value="">All vehicles</MenuItem>
                {vehicles.map((vehicle) => <MenuItem key={vehicle} value={vehicle}>{vehicle}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="From" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="To" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={loadRows} disabled={loading}>Apply filters</Button>
                <Button variant="outlined" onClick={() => {
                  setFilterDriver("");
                  setFilterVehicle("");
                  setFromDate("");
                  setToDate("");
                  setTimeout(loadRows, 0);
                }}>Clear</Button>
              </Stack>
            </Grid>
          </Grid>
          <RosterCalendar rows={filteredRows} viewDate={viewDate} viewMode={viewMode} />
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <DataGrid
            rows={filteredRows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            slots={{ toolbar: GridToolbar }}
            sx={{ minWidth: 1350 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
