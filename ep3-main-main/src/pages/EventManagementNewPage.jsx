import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  Link,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import QrCodeIcon from "@mui/icons-material/QrCode";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis
} from "recharts";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];
const today = () => new Date().toISOString().slice(0, 10);
const dateOnly = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");
const titleCase = (value) => String(value || "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
const eventTypes = ["Conference", "Offline Event", "Online", "Placement Fair", "Workshop", "Seminar", "Webinar", "Cultural", "Sports", "Other"];
const genderOptions = ["Male", "Female", "Other"];
const yesNo = ["Yes", "No"];

const config = {
  events: {
    title: "Events",
    group: "Event management new",
    endpoint: "events",
    fields: ["eventname", "eventcode", "type", "mode", "academicyear", "startdate", "enddate", "venue", "description", "registrationstartdate", "registrationenddate", "status", "publicregistration", "certificateenabled", "feedbackrequired"],
    defaults: { type: "Conference", mode: "Offline", academicyear: "2026-27", startdate: today(), enddate: today(), registrationstartdate: today(), registrationenddate: today(), status: "Active", publicregistration: "Yes", certificateenabled: "Yes", feedbackrequired: "Yes" }
  },
  attendees: {
    title: "Attendee Management",
    group: "Event management new",
    endpoint: "attendees",
    fields: ["eventid", "role", "attendee", "email", "phone", "gender", "designation", "institution", "city", "state", "country", "needsaccommodation", "occupancytype", "needstransport", "pickuprequired", "droprequired", "status", "comments"],
    defaults: { registrationtype: "Internal", role: "Participant", gender: "Male", needsaccommodation: "No", occupancytype: "Single", needstransport: "No", pickuprequired: "No", droprequired: "No", status: "Approved" }
  },
  distinguished: {
    title: "Distinguished Attendees",
    group: "Event management new",
    endpoint: "distinguished",
    fields: ["eventid", "attendee", "email", "phone", "gender", "designation", "institution", "protocol", "remarks", "status"],
    defaults: { gender: "Male", status: "Confirmed" }
  },
  guestbuildings: {
    title: "Guest House Buildings",
    group: "Guest house",
    endpoint: "guestbuildings",
    fields: ["building", "description", "type", "location", "status"],
    defaults: { type: "University", status: "Active" }
  },
  guestrooms: {
    title: "Guest House Rooms",
    group: "Guest house",
    endpoint: "guestrooms",
    fields: ["building", "floor", "roomno", "roomtype", "occupancytype", "genderpreference", "rentperday", "noofbeds", "status"],
    defaults: { roomtype: "Standard", occupancytype: "Single", genderpreference: "Any", rentperday: 0, noofbeds: 1, status: "Active" }
  },
  guestreservations: {
    title: "Guest House Reservations",
    group: "Guest house",
    endpoint: "guestreservations",
    fields: ["eventid", "building", "floor", "roomno", "roomtype", "occupancytype", "guestname", "guestemail", "gender", "fromdate", "todate", "status", "allocationmode", "remarks"],
    defaults: { gender: "Male", fromdate: today(), todate: today(), status: "Reserved", allocationmode: "Manual" }
  },
  vehicles: {
    title: "Vehicle Master",
    group: "Event management new",
    endpoint: "vehicles",
    fields: ["vehicleno", "vehiclename", "vehicletype", "capacity", "drivername", "driverphone", "status", "remarks"],
    defaults: { vehicletype: "Car", capacity: 4, status: "Available" }
  },
  transportrequirements: {
    title: "Pickup and Drop Requirements",
    group: "Event management new",
    endpoint: "transportrequirements",
    fields: ["eventid", "attendee", "email", "requirementtype", "vehicletype", "passengercount", "location", "destination", "requirementdate", "requirementtime", "status", "remarks"],
    defaults: { requirementtype: "Pickup", vehicletype: "Car", passengercount: 1, requirementdate: today(), requirementtime: "09:00", status: "Pending" }
  },
  vehicleallocations: {
    title: "Vehicle Allocations",
    group: "Event management new",
    endpoint: "vehicleallocations",
    fields: ["eventid", "attendee", "email", "requirementtype", "vehicleno", "vehiclename", "vehicletype", "drivername", "driverphone", "allocationdate", "allocationtime", "location", "destination", "allocationmode", "status", "remarks"],
    defaults: { allocationdate: today(), allocationtime: "09:00", allocationmode: "Manual", status: "Allocated" }
  },
  papersubmissions: {
    title: "Paper Submissions",
    group: "Event management new",
    endpoint: "papersubmissions",
    fields: ["eventid", "attendee", "email", "phone", "papertitle", "authors", "abstract", "keywords", "paperlink", "paperfilename", "submitteddate", "status", "remarks"],
    defaults: { submitteddate: today(), status: "Submitted" }
  }
};

function emptyFor(mode) {
  return { ...(config[mode]?.defaults || {}) };
}

function FieldInput({ field, value, setValue, options, events }) {
  const label = titleCase(field);
  const eventValue = value || "";
  if (["startdate", "enddate", "registrationstartdate", "registrationenddate", "fromdate", "todate", "requirementdate", "allocationdate"].includes(field)) {
    return <TextField fullWidth type="date" label={label} value={dateOnly(value)} onChange={(e) => setValue(field, e.target.value)} InputLabelProps={{ shrink: true }} />;
  }
  if (field === "description" || field === "comments" || field === "remarks" || field === "protocol") {
    return <TextField fullWidth multiline minRows={2} label={label} value={eventValue} onChange={(e) => setValue(field, e.target.value)} />;
  }
  if (field === "eventid") {
    return (
      <TextField select fullWidth label="Event" value={eventValue} onChange={(e) => setValue(field, e.target.value)}>
        {(events || []).map((event) => <MenuItem key={event._id} value={event._id}>{event.eventname} ({event.eventcode})</MenuItem>)}
      </TextField>
    );
  }
  if (field === "type") {
    return <TextField select fullWidth label={label} value={eventValue} onChange={(e) => setValue(field, e.target.value)}>{eventTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>;
  }
  if (field === "gender") {
    return <TextField select fullWidth label={label} value={eventValue} onChange={(e) => setValue(field, e.target.value)}>{genderOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>;
  }
  if (["publicregistration", "certificateenabled", "feedbackrequired", "needsaccommodation", "needstransport", "pickuprequired", "droprequired"].includes(field)) {
    return <TextField select fullWidth label={label} value={eventValue} onChange={(e) => setValue(field, e.target.value)}>{yesNo.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>;
  }
  if (["mode"].includes(field)) {
    return <TextField select fullWidth label={label} value={eventValue} onChange={(e) => setValue(field, e.target.value)}>{["Offline", "Online", "Hybrid"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>;
  }
  if (["occupancytype"].includes(field)) {
    return <TextField select fullWidth label={label} value={eventValue} onChange={(e) => setValue(field, e.target.value)}>{["Single", "Double"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>;
  }
  if (["status"].includes(field)) {
    return <TextField select fullWidth label={label} value={eventValue} onChange={(e) => setValue(field, e.target.value)}>{["Active", "Inactive", "Applied", "Approved", "Rejected", "Confirmed", "Reserved", "Allocated", "Pending", "Cancelled"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>;
  }
  if (["rentperday", "noofbeds", "capacity", "passengercount"].includes(field)) {
    return <TextField fullWidth type="number" label={label} value={eventValue} onChange={(e) => setValue(field, e.target.value)} />;
  }
  const values = options[field] || [];
  if (values.length) {
    return <TextField select fullWidth label={label} value={eventValue} onChange={(e) => setValue(field, e.target.value)}>{values.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>;
  }
  return <TextField fullWidth label={label} value={eventValue} onChange={(e) => setValue(field, e.target.value)} />;
}

function CrudPage({ mode }) {
  const cfg = config[mode];
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyFor(mode));
  const [options, setOptions] = useState({});
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [qr, setQr] = useState("");

  const valueOptions = useMemo(() => {
    const map = {};
    rows.forEach((row) => cfg.fields.forEach((field) => {
      const value = row[field];
      if (value !== undefined && value !== null && String(value).trim()) map[field] = [...new Set([...(map[field] || []), String(value)])].sort();
    }));
    return map;
  }, [rows, cfg.fields]);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/event-management-new/options", { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post(`/api/v2/event-management-new/${cfg.endpoint}/list`, { colid: global1.colid });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || `Unable to load ${cfg.title}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setForm(emptyFor(mode));
    setSelected([]);
    setQr("");
    loadOptions();
    loadRows();
  }, [mode]);

  const setValue = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "eventid") {
        const event = (options.events || []).find((item) => item._id === value);
        if (event) {
          next.eventname = event.eventname;
          next.eventcode = event.eventcode;
        }
      }
      return next;
    });
  };

  const save = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await ep1.post(`/api/v2/event-management-new/${cfg.endpoint}/save`, { ...form, colid: global1.colid, user: global1.user, name: global1.name });
      setMessage("Saved.");
      setForm(emptyFor(mode));
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save");
    } finally {
      setBusy(false);
    }
  };

  const edit = (row) => {
    const next = { ...emptyFor(mode), ...row, id: row._id };
    cfg.fields.forEach((field) => {
      if (String(field).includes("date")) next[field] = dateOnly(row[field]);
    });
    setForm(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (ids = selected) => {
    if (!ids.length || !window.confirm(`Delete ${ids.length} selected record(s)?`)) return;
    setBusy(true);
    try {
      await ep1.post(`/api/v2/event-management-new/${cfg.endpoint}/delete`, { colid: global1.colid, ids });
      setMessage("Deleted.");
      setSelected([]);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete");
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = () => {
    const row = cfg.fields.reduce((acc, field) => ({ ...acc, [field]: form[field] || "" }), {});
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([row]), cfg.title);
    XLSX.writeFile(wb, `${cfg.endpoint}_template.xlsx`);
  };

  const bulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      await ep1.post(`/api/v2/event-management-new/${cfg.endpoint}/bulk`, { colid: global1.colid, rows, user: global1.user, name: global1.name });
      setMessage(`${rows.length} row(s) uploaded.`);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload");
    } finally {
      setBusy(false);
    }
  };

  const makeQr = async (row) => {
    const url = `${window.location.origin}/event-new-public-register?colid=${global1.colid}&eventid=${row._id}`;
    setQr(await QRCode.toDataURL(url));
  };

  const approve = async (status) => {
    setBusy(true);
    try {
      await ep1.post("/api/v2/event-management-new/attendees/approve", { colid: global1.colid, ids: selected, status, user: global1.user });
      setMessage(`Selected attendee(s) marked ${status}.`);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update status");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { field: "actions", headerName: "Actions", width: mode === "events" ? 220 : 150, sortable: false, renderCell: ({ row }) => (
      <Stack direction="row" spacing={1}>
        <Button size="small" onClick={() => edit(row)}>Edit</Button>
        <Button size="small" color="error" onClick={() => remove([row._id])}>Delete</Button>
        {mode === "events" && <Button size="small" startIcon={<QrCodeIcon />} onClick={() => makeQr(row)}>QR</Button>}
      </Stack>
    ) },
    ...cfg.fields.filter((field) => field !== "eventid").map((field) => ({ field, headerName: titleCase(field), minWidth: 150, flex: 1, valueGetter: (params) => String(field).includes("date") ? dateOnly(params.row[field]) : params.row[field] }))
  ];

  return (
    <MenuPageShell title={cfg.title}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}><Link component={RouterLink} to="/">Home</Link><Typography>{cfg.group}</Typography><Typography>{cfg.title}</Typography></Breadcrumbs>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{form.id ? "Edit Entry" : "New Entry"}</Typography>
          <Grid container spacing={2}>
            {cfg.fields.map((field) => (
              <Grid item xs={12} md={field === "description" || field === "comments" || field === "remarks" ? 12 : 3} key={field}>
                <FieldInput field={field} value={form[field]} setValue={setValue} options={valueOptions} events={options.events} />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={busy ? <CircularProgress size={18} /> : <SaveIcon />} disabled={busy} onClick={save}>Save</Button>
                <Button variant="outlined" onClick={() => setForm(emptyFor(mode))}>Clear</Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadTemplate}>Template</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={busy}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={bulkUpload} /></Button>
                {!!selected.length && <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={() => remove()}>Bulk Delete</Button>}
                {mode === "attendees" && !!selected.length && <><Button variant="outlined" onClick={() => approve("Approved")}>Approve</Button><Button variant="outlined" color="warning" onClick={() => approve("Rejected")}>Reject</Button></>}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        {qr && <Paper sx={{ p: 2, mb: 2 }}><Typography variant="h6">Public Registration QR</Typography><img src={qr} alt="Registration QR" width={180} /><Box><Button startIcon={<PrintIcon />} onClick={() => window.print()}>Print QR</Button></Box></Paper>}
        <Paper sx={{ p: 1 }}>
          {loading && <CircularProgress size={22} />}
          <DataGrid rows={rows} columns={columns} checkboxSelection onRowSelectionModelChange={(ids) => setSelected(ids)} rowSelectionModel={selected} autoHeight pageSizeOptions={[25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} slots={{ toolbar: GridToolbar }} />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}

function AllocationPage({ type }) {
  const [options, setOptions] = useState({ events: [], ollama: [], geminiModels: [] });
  const [form, setForm] = useState({ eventid: "", useai: "No", provider: "Gemini", geminiModel: "gemini-2.5-flash", ollamaConfigId: "", rules: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [airesponse, setAiresponse] = useState("");
  useEffect(() => { ep1.get("/api/v2/event-management-new/options", { params: { colid: global1.colid } }).then((res) => setOptions(res.data || {})); }, []);
  const run = async () => {
    setBusy(true); setMessage(""); setError(""); setAiresponse("");
    try {
      const url = type === "guest" ? "/api/v2/event-management-new/guesthouse/allocate" : "/api/v2/event-management-new/vehicles/allocate";
      const res = await ep1.post(url, { ...form, colid: global1.colid, user: global1.user, name: global1.name });
      setMessage(`${res.data.count || 0} allocation(s) created.`);
      setAiresponse(res.data.airesponse || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to allocate");
    } finally { setBusy(false); }
  };
  return (
    <MenuPageShell title={type === "guest" ? "Guest House Allocation" : "Vehicle Allocation"}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}><Link component={RouterLink} to="/">Home</Link><Typography>{type === "guest" ? "Guest house" : "Event management new"}</Typography><Typography>{type === "guest" ? "Guest House Allocation" : "Vehicle Allocation"}</Typography></Breadcrumbs>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField select fullWidth label="Event" value={form.eventid} onChange={(e) => setForm({ ...form, eventid: e.target.value })}>{(options.events || []).map((event) => <MenuItem key={event._id} value={event._id}>{event.eventname} ({event.eventcode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Use AI" value={form.useai} onChange={(e) => setForm({ ...form, useai: e.target.value })}>{yesNo.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}><MenuItem value="Gemini">Gemini</MenuItem><MenuItem value="Ollama">Ollama</MenuItem></TextField></Grid>
            {form.provider === "Gemini" ? <Grid item xs={12} md={4}><TextField select fullWidth label="Gemini Model" value={form.geminiModel} onChange={(e) => setForm({ ...form, geminiModel: e.target.value })}>{(options.geminiModels || []).map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid> : <Grid item xs={12} md={4}><TextField select fullWidth label="Ollama Model" value={form.ollamaConfigId} onChange={(e) => setForm({ ...form, ollamaConfigId: e.target.value })}>{(options.ollama || []).map((x) => <MenuItem key={x._id} value={x._id}>{x.name} ({x.modelname})</MenuItem>)}</TextField></Grid>}
            <Grid item xs={12}><TextField fullWidth multiline minRows={5} label="Allocation rules and additional prompt" value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} /></Grid>
            <Grid item xs={12}><Button variant="contained" startIcon={busy ? <CircularProgress size={18} /> : <AutoAwesomeIcon />} disabled={busy || !form.eventid} onClick={run}>{busy ? "Allocating..." : "Auto Allocate"}</Button></Grid>
          </Grid>
        </Paper>
        {airesponse && <Paper sx={{ p: 2, mt: 2 }}><Typography variant="h6">AI Response</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{airesponse}</Typography></Paper>}
      </Container>
    </MenuPageShell>
  );
}

function AvailabilityPage() {
  const [form, setForm] = useState({ fromdate: today(), todate: today() });
  const [rows, setRows] = useState([]);
  const load = async () => {
    const res = await ep1.post("/api/v2/event-management-new/guesthouse/availability", { ...form, colid: global1.colid });
    setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
  };
  useEffect(() => { load(); }, []);
  return (
    <MenuPageShell title="Guest House Availability">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}><Link component={RouterLink} to="/">Home</Link><Typography>Guest house</Typography><Typography>Availability</Typography></Breadcrumbs>
        <Paper sx={{ p: 2, mb: 2 }}><Stack direction="row" spacing={2}><TextField type="date" label="From Date" value={form.fromdate} onChange={(e) => setForm({ ...form, fromdate: e.target.value })} InputLabelProps={{ shrink: true }} /><TextField type="date" label="To Date" value={form.todate} onChange={(e) => setForm({ ...form, todate: e.target.value })} InputLabelProps={{ shrink: true }} /><Button variant="contained" onClick={load}>Check</Button><Button startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button></Stack></Paper>
        <Grid container spacing={2} sx={{ mb: 2 }}>{rows.slice(0, 4).map((row) => <Grid item xs={12} md={3} key={row._id}><Card><CardContent><Typography variant="h6">{row.building} {row.roomno}</Typography><Typography>Available beds: {row.availablebeds}</Typography><Typography>Occupied: {row.occupied}</Typography></CardContent></Card></Grid>)}</Grid>
        <Paper sx={{ p: 1 }}><DataGrid rows={rows} columns={["building", "floor", "roomno", "roomtype", "occupancytype", "noofbeds", "occupied", "availablebeds"].map((field) => ({ field, headerName: titleCase(field), flex: 1, minWidth: 130 }))} autoHeight slots={{ toolbar: GridToolbar }} /></Paper>
      </Container>
    </MenuPageShell>
  );
}

function ReportsPage({ area = "event" }) {
  const [data, setData] = useState({ events: [], attendees: [], reservations: [], vehicles: [], allocations: [], feedback: [] });
  const [pivot, setPivot] = useState(["eventcode"]);
  const rows = area === "guest" ? data.reservations : area === "transport" ? data.allocations : data.attendees;
  useEffect(() => { ep1.post("/api/v2/event-management-new/report", { colid: global1.colid }).then((res) => setData(res.data.data || {})); }, []);
  const fields = [...new Set(rows.flatMap((row) => Object.keys(row || {})))].filter((field) => !["_id", "__v"].includes(field));
  const summary = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = pivot.map((field) => row[field] || "NA").join(" / ");
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].map(([name, count]) => ({ name, count }));
  }, [rows, pivot]);
  return (
    <MenuPageShell title={area === "guest" ? "Guest House Reports" : area === "transport" ? "Transport Reports" : "Event Reports"}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}><Link component={RouterLink} to="/">Home</Link><Typography>{area === "guest" ? "Guest house" : "Event management new"}</Typography><Typography>Reports</Typography></Breadcrumbs>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            ["Events", data.events?.length || 0],
            ["Attendees", data.attendees?.length || 0],
            ["Reservations", data.reservations?.length || 0],
            ["Vehicle Trips", data.allocations?.length || 0]
          ].map(([label, value]) => <Grid item xs={12} md={3} key={label}><Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h4">{value}</Typography></CardContent></Card></Grid>)}
        </Grid>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <FormControl sx={{ minWidth: 320 }}><InputLabel>Pivot Fields</InputLabel><Select multiple label="Pivot Fields" value={pivot} onChange={(e) => setPivot(e.target.value)} renderValue={(selected) => selected.join(", ")}>{fields.map((field) => <MenuItem key={field} value={field}><Checkbox checked={pivot.includes(field)} /><ListItemText primary={titleCase(field)} /></MenuItem>)}</Select></FormControl>
            <Button startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button>
          </Stack>
        </Paper>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={7}><Paper sx={{ p: 2, height: 320 }}><ResponsiveContainer><BarChart data={summary}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis allowDecimals={false} /><ChartTooltip /><Bar dataKey="count">{summary.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></Paper></Grid>
          <Grid item xs={12} md={5}><Paper sx={{ p: 2, height: 320 }}><ResponsiveContainer><PieChart><Pie data={summary} dataKey="count" nameKey="name" outerRadius={110} label>{summary.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><ChartTooltip /></PieChart></ResponsiveContainer></Paper></Grid>
        </Grid>
        <Paper sx={{ p: 1, mb: 2 }}><Typography variant="h6" sx={{ p: 1 }}>Pivot Summary</Typography><DataGrid rows={summary.map((row, i) => ({ id: i, ...row }))} columns={[{ field: "name", headerName: "Group", flex: 2 }, { field: "count", headerName: "Count", flex: 1 }]} autoHeight slots={{ toolbar: GridToolbar }} /></Paper>
        <Paper sx={{ p: 1 }}><Typography variant="h6" sx={{ p: 1 }}>Details</Typography><DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={fields.map((field) => ({ field, headerName: titleCase(field), minWidth: 150, flex: 1, valueGetter: (params) => String(field).includes("date") ? dateOnly(params.row[field]) : params.row[field] }))} autoHeight pageSizeOptions={[25, 50, 100]} slots={{ toolbar: GridToolbar }} /></Paper>
      </Container>
    </MenuPageShell>
  );
}

function PublicRegisterPage() {
  const [params] = useSearchParams();
  const colid = params.get("colid");
  const eventid = params.get("eventid");
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ eventid: eventid || "", role: "Participant", attendee: "", email: "", phone: "", gender: "Male", designation: "", institution: "", needsaccommodation: "No", occupancytype: "Single", needstransport: "No", pickuprequired: "No", droprequired: "No" });
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { ep1.get("/api/v2/event-management-new/public/events", { params: { colid } }).then((res) => setEvents(res.data.data || [])); }, [colid]);
  const submit = async () => {
    try {
      const res = await ep1.post("/api/v2/event-management-new/public/register", { ...form, colid, eventid: form.eventid || eventid });
      setSaved(res.data.data);
    } catch (err) { setError(err.response?.data?.message || "Unable to register"); }
  };
  if (saved) return <PublicFeedbackPage attendeeid={saved._id} colid={colid} />;
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>Event Registration</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Register for conference, online, offline, placement fair and institutional events.</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}><TextField select fullWidth label="Event" value={form.eventid} onChange={(e) => setForm({ ...form, eventid: e.target.value })}>{events.map((event) => <MenuItem key={event._id} value={event._id}>{event.eventname} ({event.eventcode})</MenuItem>)}</TextField></Grid>
          {["attendee", "email", "phone", "designation", "institution", "city", "state", "country"].map((field) => <Grid item xs={12} md={6} key={field}><TextField fullWidth label={titleCase(field)} value={form[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} /></Grid>)}
          <Grid item xs={12} md={4}><TextField select fullWidth label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>{genderOptions.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField select fullWidth label="Accommodation" value={form.needsaccommodation} onChange={(e) => setForm({ ...form, needsaccommodation: e.target.value })}>{yesNo.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField select fullWidth label="Transport" value={form.needstransport} onChange={(e) => setForm({ ...form, needstransport: e.target.value })}>{yesNo.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12}><Button variant="contained" size="large" onClick={submit}>Submit Registration</Button></Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

function PublicFeedbackPage({ attendeeid: propAttendeeId, colid: propColid }) {
  const [params] = useSearchParams();
  const attendeeid = propAttendeeId || params.get("attendeeid");
  const colid = propColid || params.get("colid");
  const [form, setForm] = useState({ rating: 5, contentquality: 5, hospitality: 5, logistics: 5, comments: "" });
  const [cert, setCert] = useState(null);
  const submit = async () => {
    const res = await ep1.post("/api/v2/event-management-new/public/feedback", { ...form, attendeeid, colid });
    setCert(res.data.certificate);
  };
  if (cert) return <Container maxWidth="md" sx={{ py: 4 }}><CertificateView cert={cert} /></Container>;
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Feedback</Typography>
        <Grid container spacing={2}>
          {["rating", "contentquality", "hospitality", "logistics"].map((field) => <Grid item xs={12} md={3} key={field}><TextField type="number" inputProps={{ min: 1, max: 5 }} fullWidth label={titleCase(field)} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} /></Grid>)}
          <Grid item xs={12}><TextField fullWidth multiline minRows={4} label="Comments" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} /></Grid>
          <Grid item xs={12}><Button variant="contained" onClick={submit}>Submit Feedback and Download Certificate</Button></Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

function CertificateView({ cert }) {
  return (
    <Paper sx={{ p: 5, textAlign: "center", border: "8px double #1d4ed8" }}>
      <Typography variant="overline">Certificate No: {cert.certificateno}</Typography>
      <Typography variant="h3" sx={{ my: 3 }}>Certificate of Participation</Typography>
      <Typography variant="h6">This is to certify that</Typography>
      <Typography variant="h4" sx={{ my: 2 }}>{cert.attendee}</Typography>
      <Typography variant="h6">participated in</Typography>
      <Typography variant="h4" sx={{ my: 2 }}>{cert.eventname}</Typography>
      <Typography>Issued on {dateOnly(cert.issuedate)}</Typography>
      <Button sx={{ mt: 4 }} startIcon={<PrintIcon />} variant="contained" onClick={() => window.print()}>Print / Download</Button>
    </Paper>
  );
}

function PublicCertificatePage() {
  const [params] = useSearchParams();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    ep1.get("/api/v2/event-management-new/public/certificate", { params: { id: params.get("id"), colid: params.get("colid") } })
      .then((res) => setCert(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Certificate not found"));
  }, [params]);
  return <Container maxWidth="md" sx={{ py: 4 }}>{error && <Alert severity="error">{error}</Alert>}{cert && <CertificateView cert={cert} />}</Container>;
}

function EventPaperSubmissionInnerPage() {
  const [login, setLogin] = useState({ email: "", phone: "" });
  const [attendees, setAttendees] = useState([]);
  const [attendee, setAttendee] = useState("");
  const [form, setForm] = useState({ papertitle: "", authors: "", abstract: "", keywords: "", paperlink: "", paperfilename: "", remarks: "" });
  const [submissions, setSubmissions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selectedAttendee = attendees.find((item) => item._id === attendee);
  const load = async () => {
    setBusy(true); setError(""); setMessage("");
    try {
      const res = await ep1.get("/api/v2/event-management-new/papers/attendee-options", { params: { colid: global1.colid, ...login } });
      setAttendees(res.data.attendees || []);
      setSubmissions((res.data.submissions || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load approved event registrations");
    } finally {
      setBusy(false);
    }
  };
  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("colid", global1.colid);
      const res = await ep1.post("/api/v2/event-management-new/papers/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
      setForm((prev) => ({ ...prev, paperlink: res.data.url || "", paperfilename: res.data.filename || file.name }));
      setMessage("Paper uploaded to AWS");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload paper");
    } finally {
      setBusy(false);
    }
  };
  const submit = async () => {
    if (!attendee) return setError("Select conference registration");
    if (!form.papertitle || !form.paperlink) return setError("Paper title and uploaded paper are required");
    setBusy(true);
    try {
      await ep1.post("/api/v2/event-management-new/papers/submit", { ...form, attendeeid: attendee, colid: global1.colid, user: global1.user, name: global1.name });
      setMessage("Paper submitted");
      setForm({ papertitle: "", authors: "", abstract: "", keywords: "", paperlink: "", paperfilename: "", remarks: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit paper");
    } finally {
      setBusy(false);
    }
  };
  return (
    <MenuPageShell title="Upload conference paper">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}><Link component={RouterLink} to="/">Home</Link><Typography>Event management new</Typography><Typography>Upload paper</Typography></Breadcrumbs>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Attendee Login</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField fullWidth label="Registered email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Phone" value={login.phone} onChange={(e) => setLogin({ ...login, phone: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={busy} onClick={load}>Login / Load</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField select fullWidth label="Conference / Event Registration" value={attendee} onChange={(e) => setAttendee(e.target.value)}>{attendees.map((item) => <MenuItem key={item._id} value={item._id}>{item.eventname} ({item.eventcode}) - {item.attendee}</MenuItem>)}</TextField></Grid>
            {selectedAttendee && <Grid item xs={12} md={6}><Chip color="success" label={`${selectedAttendee.status} registration: ${selectedAttendee.email}`} /></Grid>}
            {["papertitle", "authors", "keywords"].map((field) => <Grid item xs={12} md={field === "papertitle" ? 5 : 3.5} key={field}><TextField fullWidth label={titleCase(field)} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} /></Grid>)}
            <Grid item xs={12}><TextField fullWidth multiline minRows={4} label="Abstract" value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><Button component="label" fullWidth variant="outlined" startIcon={<UploadFileIcon />} disabled={busy}>Upload paper<input hidden type="file" onChange={(e) => upload(e.target.files?.[0])} /></Button></Grid>
            <Grid item xs={12} md={9}><TextField fullWidth label="Paper link" value={form.paperlink} onChange={(e) => setForm({ ...form, paperlink: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Grid>
            <Grid item xs={12}><Button variant="contained" disabled={busy} onClick={submit}>Submit paper</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ p: 1 }}>My Submissions</Typography>
          <DataGrid rows={submissions} columns={["eventname", "eventcode", "papertitle", "authors", "paperlink", "submitteddate", "status"].map((field) => ({ field, headerName: titleCase(field), minWidth: 150, flex: 1, valueGetter: (params) => field.includes("date") ? dateOnly(params.row[field]) : params.row[field] }))} autoHeight slots={{ toolbar: GridToolbar }} />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}

function EventPaperSubmissionReportInnerPage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([]);
  const [data, setData] = useState({ events: [], attendees: [], papersubmissions: [] });
  useEffect(() => { ep1.post("/api/v2/event-management-new/report", { colid: global1.colid }).then((res) => setData(res.data.data || {})); }, []);
  const fields = ["eventname", "eventcode", "attendee", "email", "phone", "papertitle", "authors", "keywords", "status"];
  const load = async () => {
    const res = await ep1.post("/api/v2/event-management-new/papersubmissions/list", { colid: global1.colid, filters });
    setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
  };
  useEffect(() => { load(); }, []);
  const summary = useMemo(() => {
    const source = rows.length ? rows : (data.papersubmissions || []);
    const byEvent = Object.values(source.reduce((acc, item) => {
      const key = item.eventname || "Not specified";
      acc[key] = acc[key] || { name: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {}));
    return { total: source.length, events: new Set(source.map((item) => item.eventcode)).size, byEvent };
  }, [rows, data.papersubmissions]);
  return (
    <MenuPageShell title="Paper submission report">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}><Link component={RouterLink} to="/">Home</Link><Typography>Event management new</Typography><Typography>Paper submission report</Typography></Breadcrumbs>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack spacing={2}>
            {filters.map((filter, index) => <Grid container spacing={2} key={index}><Grid item xs={12} md={3}><TextField select fullWidth label="Field" value={filter.field} onChange={(e) => setFilters((prev) => prev.map((f, i) => i === index ? { ...f, field: e.target.value } : f))}>{fields.map((field) => <MenuItem key={field} value={field}>{titleCase(field)}</MenuItem>)}</TextField></Grid><Grid item xs={12} md={6}><TextField fullWidth label="Value" value={filter.value} onChange={(e) => setFilters((prev) => prev.map((f, i) => i === index ? { ...f, value: e.target.value } : f))} /></Grid><Grid item xs={12} md={2}><Button color="error" onClick={() => setFilters((prev) => prev.filter((_, i) => i !== index))}>Remove</Button></Grid></Grid>)}
            <Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => setFilters((prev) => [...prev, { field: "eventname", value: "" }])}>Add filter</Button><Button variant="contained" onClick={load}>Apply</Button><Button startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button></Stack>
          </Stack>
        </Paper>
        <Grid container spacing={2} sx={{ mb: 2 }}><Grid item xs={12} md={3}><Card><CardContent><Typography>Total submissions</Typography><Typography variant="h4">{summary.total}</Typography></CardContent></Card></Grid><Grid item xs={12} md={3}><Card><CardContent><Typography>Events</Typography><Typography variant="h4">{summary.events}</Typography></CardContent></Card></Grid></Grid>
        <Paper sx={{ p: 2, mb: 2, height: 320 }}><ResponsiveContainer><BarChart data={summary.byEvent}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis allowDecimals={false} /><ChartTooltip /><Bar dataKey="count">{summary.byEvent.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></Paper>
        <Paper sx={{ p: 1 }}><DataGrid rows={rows} columns={["eventname", "eventcode", "attendee", "email", "phone", "papertitle", "authors", "keywords", "paperlink", "submitteddate", "status", "remarks"].map((field) => ({ field, headerName: titleCase(field), minWidth: 150, flex: 1, valueGetter: (params) => field.includes("date") ? dateOnly(params.row[field]) : params.row[field] }))} autoHeight slots={{ toolbar: GridToolbar }} /></Paper>
      </Container>
    </MenuPageShell>
  );
}

export function EventNewCrudPage({ mode }) { return <CrudPage mode={mode} />; }
export function EventNewAllocationPage() { return <AllocationPage type="vehicle" />; }
export function GuestHouseAllocationPage() { return <AllocationPage type="guest" />; }
export function GuestHouseAvailabilityPage() { return <AvailabilityPage />; }
export function EventNewReportsPage() { return <ReportsPage area="event" />; }
export function GuestHouseReportsPage() { return <ReportsPage area="guest" />; }
export function EventNewTransportReportsPage() { return <ReportsPage area="transport" />; }
export function EventNewPublicRegisterPage() { return <PublicRegisterPage />; }
export function EventNewPublicFeedbackPage() { return <PublicFeedbackPage />; }
export function EventNewPublicCertificatePage() { return <PublicCertificatePage />; }
export function EventPaperSubmissionPage() { return <EventPaperSubmissionInnerPage />; }
export function EventPaperSubmissionReportPage() { return <EventPaperSubmissionReportInnerPage />; }
