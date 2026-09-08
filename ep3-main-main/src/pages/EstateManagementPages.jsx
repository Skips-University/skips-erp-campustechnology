import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { AutoAwesome, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import PrintIcon from "@mui/icons-material/Print";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const statusOptions = ["Active", "Inactive"];
const providerTypes = ["Vendor", "Inhouse", "External"];
const rosterProviders = ["Manual", "Gemini", "Ollama"];
const commonPayload = () => ({ colid: global1.colid, user: global1.user, name: global1.name });
const apiBase = "/api/v2/estate-management";
const messageFrom = (err, fallback) => err.response?.data?.message || fallback;

const modules = {
  types: {
    title: "Real Estate Types",
    subtitle: "Define building, land, hostel, clinic, lab, leased space or any other real estate classification.",
    fields: [
      { name: "typename", label: "Type name", required: true },
      { name: "description", label: "Description", multiline: true },
      { name: "status", label: "Status", select: statusOptions }
    ],
    template: { typename: "Academic building", description: "Teaching block, lab block or office block", status: "Active" }
  },
  campuses: {
    title: "Campus",
    subtitle: "Maintain campus master details with geo-location and campus director information.",
    fields: [
      { name: "campus", label: "Campus", required: true },
      { name: "location", label: "Location" },
      { name: "latitude", label: "Latitude", type: "number" },
      { name: "longitude", label: "Longitude", type: "number" },
      { name: "director", label: "Director", source: "users", optionLabel: "name" },
      { name: "directoremail", label: "Director Email" },
      { name: "status", label: "Status", select: statusOptions }
    ],
    template: { campus: "Main Campus", location: "City centre", latitude: 0, longitude: 0, director: "Director Name", directoremail: "director@example.com", status: "Active" }
  },
  estates: {
    title: "Real Estates",
    subtitle: "Capture actual real estate assets with type and location.",
    fields: [
      { name: "estatename", label: "Real estate name", required: true },
      { name: "estatecode", label: "Code" },
      { name: "estatetype", label: "Type", source: "realEstateTypes", optionLabel: "typename" },
      { name: "location", label: "Location", source: "campuses", optionLabel: "campus" },
      { name: "address", label: "Address", multiline: true },
      { name: "city", label: "City" },
      { name: "state", label: "State" },
      { name: "pincode", label: "Pincode" },
      { name: "area", label: "Area", type: "number" },
      { name: "status", label: "Status", select: statusOptions }
    ],
    template: { estatename: "Main Academic Block", estatecode: "BLK-A", estatetype: "Academic building", location: "Main campus", address: "Campus road", city: "City", state: "State", pincode: "000000", area: 50000, status: "Active" }
  },
  "service-types": {
    title: "Shared Service Master",
    subtitle: "Create shared service categories such as housekeeping, security, electrical, gardening, plumbing and HVAC.",
    fields: [
      { name: "servicetype", label: "Service type", required: true },
      { name: "description", label: "Description", multiline: true },
      { name: "status", label: "Status", select: statusOptions }
    ],
    template: { servicetype: "Housekeeping", description: "Cleaning and upkeep services", status: "Active" }
  },
  "meeting-features": {
    title: "Meeting Room Features",
    subtitle: "Define meeting room facilities such as AV facilities, projector, sound system and custom features.",
    fields: [
      { name: "feature", label: "Feature", required: true, customSelect: ["AV facilities", "Projector", "Sound system", "Others"] },
      { name: "description", label: "Description", multiline: true },
      { name: "status", label: "Status", select: statusOptions }
    ],
    template: { feature: "Projector", description: "LCD or laser projector", status: "Active" }
  },
  "meeting-rooms": {
    title: "Meeting Rooms",
    subtitle: "Create meeting rooms from estate buildings with owner, capacity and facilities.",
    fields: [
      { name: "building", label: "Building", required: true },
      { name: "location", label: "Location" },
      { name: "roomname", label: "Meeting room", required: true },
      { name: "roomcode", label: "Room code" },
      { name: "ownername", label: "Owner" },
      { name: "owneremail", label: "Owner email" },
      { name: "capacity", label: "Capacity", type: "number" },
      { name: "features", label: "Features" },
      { name: "status", label: "Status", select: statusOptions }
    ],
    template: { building: "Main Academic Block", location: "Main campus", roomname: "Board Room", roomcode: "BR-01", ownername: "Admin", owneremail: "admin@example.com", capacity: 40, features: "Projector,Sound system", status: "Active" }
  },
  "meeting-bookings": {
    title: "Meeting Room Planner",
    subtitle: "Search available meeting rooms, book them by time, and view bookings in daily, weekly or monthly calendar.",
    fields: [
      { name: "bookingdate", label: "Date", type: "date" },
      { name: "roomname", label: "Room" },
      { name: "building", label: "Building" },
      { name: "meetingtitle", label: "Meeting" },
      { name: "bookedbyname", label: "Booked by" },
      { name: "fromtime", label: "From" },
      { name: "totime", label: "To" },
      { name: "sharedservices", label: "Shared services" },
      { name: "status", label: "Status" }
    ]
  },
  providers: {
    title: "Shared Service Providers",
    subtitle: "Register vendor, inhouse or external service providers mapped to shared service types.",
    fields: [
      { name: "servicetype", label: "Service type", source: "serviceTypes", optionLabel: "servicetype" },
      { name: "providername", label: "Provider name", required: true },
      { name: "providertype", label: "Provider type", select: providerTypes },
      { name: "contactperson", label: "Contact person" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "status", label: "Status", select: statusOptions }
    ],
    template: { servicetype: "Housekeeping", providername: "Inhouse housekeeping team", providertype: "Inhouse", contactperson: "Supervisor", email: "service@example.com", phone: "9999999999", status: "Active" }
  },
  contracts: {
    title: "External Vendor Contracts",
    subtitle: "Maintain contract period, value and document links for external vendors.",
    fields: [
      { name: "providername", label: "Provider", source: "providers", optionLabel: "providername", required: true },
      { name: "servicetype", label: "Service type" },
      { name: "contracttype", label: "Contract type" },
      { name: "startdate", label: "Start date", type: "date" },
      { name: "enddate", label: "End date", type: "date" },
      { name: "amount", label: "Amount", type: "number" },
      { name: "description", label: "Description", multiline: true },
      { name: "documentlink", label: "Document link" },
      { name: "status", label: "Status", select: statusOptions }
    ],
    template: { providername: "ABC Services", servicetype: "Security", contracttype: "Annual", startdate: "2026-04-01", enddate: "2027-03-31", amount: 1200000, description: "Annual service contract", documentlink: "", status: "Active" }
  },
  maintenance: {
    title: "Maintenance Schedule",
    subtitle: "Plan maintenance hours estate-wise and service-wise.",
    fields: [
      { name: "estatename", label: "Real estate", required: true },
      { name: "estatecode", label: "Estate code" },
      { name: "estatetype", label: "Type" },
      { name: "location", label: "Location" },
      { name: "servicedate", label: "Schedule date", type: "date" },
      { name: "starttime", label: "Start time", type: "time" },
      { name: "endtime", label: "End time", type: "time" },
      { name: "frequency", label: "Frequency" },
      { name: "servicetype", label: "Service required", source: "serviceTypes", optionLabel: "servicetype", required: true },
      { name: "hours", label: "Hours", type: "number" },
      { name: "noofpeople", label: "No. of people", type: "number" },
      { name: "description", label: "Description", multiline: true },
      { name: "status", label: "Status", select: ["Planned", "Completed", "Cancelled", "Inactive"] }
    ],
    template: { estatename: "Main Academic Block", estatecode: "BLK-A", estatetype: "Academic building", location: "Main campus", servicedate: "2026-08-01", starttime: "09:00", endtime: "11:00", frequency: "Weekly", servicetype: "Housekeeping", hours: 2, noofpeople: 1, description: "Common area cleaning", status: "Planned" }
  },
  allocations: {
    title: "Shared Service Allocation",
    subtitle: "Allocate non-student employees to a shared service provider.",
    fields: [
      { name: "providername", label: "Provider" },
      { name: "servicetype", label: "Service type" },
      { name: "employeename", label: "Employee" },
      { name: "employeeemail", label: "Employee email" },
      { name: "employeephone", label: "Phone" },
      { name: "department", label: "Department" },
      { name: "role", label: "Role" },
      { name: "status", label: "Status" }
    ]
  },
  shifts: {
    title: "Shared Service Shift",
    subtitle: "Allocate service personnel to shift timings from the HR shift master.",
    fields: [
      { name: "servicetype", label: "Service type" },
      { name: "employeename", label: "Employee" },
      { name: "employeeemail", label: "Email" },
      { name: "location", label: "Shift location" },
      { name: "shift", label: "Shift" },
      { name: "starttime", label: "Start" },
      { name: "endtime", label: "End" },
      { name: "status", label: "Status" }
    ]
  },
  rosters: {
    title: "Daily Shared Service Roster",
    subtitle: "Create daily estate-wise deployment of shared service personnel with timing.",
    fields: [
      { name: "rosterdate", label: "Date", type: "date" },
      { name: "estatename", label: "Real estate" },
      { name: "estatecode", label: "Estate code" },
      { name: "location", label: "Location" },
      { name: "servicetype", label: "Service type" },
      { name: "employeename", label: "Employee" },
      { name: "employeeemail", label: "Email" },
      { name: "shift", label: "Shift" },
      { name: "starttime", label: "Start" },
      { name: "endtime", label: "End" },
      { name: "hours", label: "Hours" },
      { name: "source", label: "Source" },
      { name: "notes", label: "Notes" },
      { name: "status", label: "Status" }
    ]
  }
};

const blankFrom = (fields) => fields.reduce((acc, field) => ({ ...acc, [field.name]: field.select?.[0] || "" }), {});

const downloadXlsx = (row, filename, sheet = "Template") => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([row]), sheet);
  XLSX.writeFile(workbook, filename);
};

function Hero({ title, subtitle }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #dbeafe", background: "linear-gradient(135deg,#f8fafc,#eff6ff)" }}>
      <Typography variant="h5" fontWeight={900}>{title}</Typography>
      <Typography color="text.secondary">{subtitle}</Typography>
    </Paper>
  );
}

function FieldInput({ field, form, setForm, options }) {
  const value = form[field.name] ?? "";
  const [customInput, setCustomInput] = useState(String(value || ""));
  useEffect(() => {
    setCustomInput(String(value || ""));
  }, [value]);
  if (field.source) {
    const list = options[field.source] || [];
    const optionLabel = field.optionLabel || field.name;
    const selected = list.find((item) => String(item[optionLabel] || "") === String(value || "")) || null;
    return (
      <Autocomplete
        options={list}
        value={selected}
        getOptionLabel={(option) => option?.[optionLabel] || ""}
        onChange={(event, option) => {
          const patch = { [field.name]: option?.[optionLabel] || "" };
          if (field.name === "providername" && option) {
            patch.providerid = option._id;
            patch.servicetype = option.servicetype || form.servicetype;
          }
          if (field.name === "director" && option) {
            patch.directoremail = option.email || "";
          }
          if (field.name === "location" && option) {
            patch.location = option.campus || option.location || "";
          }
          setForm((prev) => ({ ...prev, ...patch }));
        }}
        renderInput={(params) => <TextField {...params} label={field.label} required={field.required} />}
      />
    );
  }
  if (field.customSelect) {
    return (
      <Autocomplete
        freeSolo
        options={field.customSelect}
        value={value}
        inputValue={customInput}
        onInputChange={(event, next) => {
          setCustomInput(next || "");
          setForm((prev) => ({ ...prev, [field.name]: next || "" }));
        }}
        onChange={(event, next) => {
          const selected = next || customInput || "";
          setCustomInput(selected);
          setForm((prev) => ({ ...prev, [field.name]: selected }));
        }}
        renderInput={(params) => <TextField {...params} label={field.label} required={field.required} />}
      />
    );
  }
  if (field.select) {
    return (
      <TextField select fullWidth label={field.label} value={value} required={field.required} onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}>
        {field.select.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
      </TextField>
    );
  }
  return (
    <TextField
      fullWidth
      multiline={field.multiline}
      minRows={field.multiline ? 3 : undefined}
      type={field.type || "text"}
      InputLabelProps={["date", "time"].includes(field.type) ? { shrink: true } : undefined}
      label={field.label}
      required={field.required}
      value={value}
      onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
    />
  );
}

function DynamicFilterPanel({ moduleName, fields, filters, setFilters, onApply }) {
  const [options, setOptions] = useState({});
  useEffect(() => {
    ep1.get(`${apiBase}/${moduleName}/options`, { params: { colid: global1.colid } })
      .then((res) => setOptions(res.data?.options || {}))
      .catch(() => setOptions({}));
  }, [moduleName]);

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Typography fontWeight={800} sx={{ mb: 1 }}>Dynamic filters</Typography>
      <Grid container spacing={1.5}>
        {fields.slice(0, 10).map((field) => (
          <Grid item xs={12} sm={6} md={2.4} key={field.name}>
            <Autocomplete
              freeSolo
              options={options[field.name] || []}
              value={filters[field.name] || ""}
              onInputChange={(event, value) => setFilters((prev) => ({ ...prev, [field.name]: value }))}
              renderInput={(params) => <TextField {...params} label={field.label} size="small" />}
            />
          </Grid>
        ))}
        <Grid item xs={12} md={2}>
          <Button fullWidth variant="contained" startIcon={<Refresh />} onClick={onApply}>Apply</Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

function CrudModulePage({ moduleName, beforeForm, rosterTools }) {
  const config = modules[moduleName];
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankFrom(config.fields));
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get(`${apiBase}/options`, { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get(`${apiBase}/${moduleName}`, { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(messageFrom(err, `Unable to load ${config.title}`));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOptions(); loadRows(); }, [moduleName]);

  const save = async () => {
    try {
      setWorking(true);
      setError("");
      setMessage("");
      await ep1.post(`${apiBase}/${moduleName}`, { ...commonPayload(), ...form, id: editingId });
      setMessage(editingId ? "Record updated." : "Record saved.");
      setEditingId("");
      setForm(blankFrom(config.fields));
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(messageFrom(err, "Unable to save record"));
    } finally {
      setWorking(false);
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      setWorking(true);
      await ep1.post(`${apiBase}/${moduleName}/delete`, { colid: global1.colid, id: row._id });
      setMessage("Record deleted.");
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(messageFrom(err, "Unable to delete record"));
    } finally {
      setWorking(false);
    }
  };

  const bulkDeleteRows = async () => {
    if (!selectedIds.length) {
      setError("Select at least one roster entry.");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} selected roster entries?`)) return;
    try {
      setWorking(true);
      setError("");
      const res = await ep1.post(`${apiBase}/${moduleName}/bulk-delete`, { colid: global1.colid, ids: selectedIds });
      setMessage(`Deleted ${res.data?.deleted || 0} roster entries.`);
      setSelectedIds([]);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(messageFrom(err, "Unable to delete selected roster entries"));
    } finally {
      setWorking(false);
    }
  };

  const uploadBulk = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    data.append("user", global1.user);
    data.append("name", global1.name);
    try {
      setWorking(true);
      const res = await ep1.post(`${apiBase}/${moduleName}/bulkupload`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(`Bulk upload completed. Inserted: ${res.data?.inserted || 0}`);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(messageFrom(err, "Bulk upload failed"));
    } finally {
      setWorking(false);
    }
  };

  const uploadContract = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    try {
      setWorking(true);
      const res = await ep1.post(`${apiBase}/contracts/upload`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setForm((prev) => ({ ...prev, documentlink: res.data?.documentlink || "" }));
      setMessage("Document uploaded and link added.");
    } catch (err) {
      setError(messageFrom(err, "Document upload failed"));
    } finally {
      setWorking(false);
    }
  };

  const columns = useMemo(() => [
    ...config.fields.map((field) => ({
      field: field.name,
      headerName: field.label,
      minWidth: field.multiline ? 240 : 150,
      flex: field.multiline ? 1.3 : 1,
      renderCell: field.name === "documentlink"
        ? (params) => params.value ? <a href={params.value} target="_blank" rel="noreferrer">Open document</a> : ""
        : undefined
    })),
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...blankFrom(config.fields), ...row }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(row)} />
      ]
    }
  ], [config.fields, rows]);

  return (
    <MenuPageShell title={config.title}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Hero title={config.title} subtitle={config.subtitle} />
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {rosterTools?.({ loadRows, setMessage, setError, setWorking, working, options })}
          <DynamicFilterPanel moduleName={moduleName} fields={config.fields} filters={filters} setFilters={setFilters} onApply={loadRows} />
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            {beforeForm?.({ form, setForm, options, setMessage, setError })}
            <Grid container spacing={2}>
              {config.fields.map((field) => (
                <Grid item xs={12} md={field.multiline ? 6 : 3} key={field.name}>
                  <FieldInput field={field} form={form} setForm={setForm} options={options} />
                </Grid>
              ))}
              {moduleName === "contracts" && (
                <Grid item xs={12} md={3}>
                  <Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />} disabled={working} sx={{ height: 56 }}>
                    Upload document
                    <input hidden type="file" onChange={uploadContract} />
                  </Button>
                </Grid>
              )}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button variant="contained" startIcon={working ? <CircularProgress size={18} color="inherit" /> : <Save />} disabled={working} onClick={save}>{editingId ? "Update" : "Save"}</Button>
                  <Button variant="outlined" onClick={() => { setEditingId(""); setForm(blankFrom(config.fields)); }}>Clear</Button>
                  <Button variant="outlined" startIcon={<FileDownload />} onClick={() => downloadXlsx(config.template || blankFrom(config.fields), `${moduleName}_template.xlsx`, config.title)}>Download template</Button>
                  <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={working}>Bulk upload<input hidden type="file" accept=".xlsx,.xls" onChange={uploadBulk} /></Button>
                  {moduleName === "rosters" && <Button variant="outlined" color="error" startIcon={<Delete />} disabled={working || !selectedIds.length} onClick={bulkDeleteRows}>Bulk delete</Button>}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ height: 640, width: "100%", overflowX: "auto" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading || working}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: moduleName } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                checkboxSelection={moduleName === "rosters"}
                rowSelectionModel={moduleName === "rosters" ? selectedIds : undefined}
                onRowSelectionModelChange={(next) => moduleName === "rosters" && setSelectedIds(Array.from(next))}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}

function EstatePickerPanel({ form, setForm, options }) {
  const [estateFilters, setEstateFilters] = useState({ estatetype: "", location: "", city: "" });
  const estates = (options.estates || []).filter((estate) => (
    (!estateFilters.estatetype || estate.estatetype === estateFilters.estatetype)
    && (!estateFilters.location || estate.location === estateFilters.location)
    && (!estateFilters.city || estate.city === estateFilters.city)
  ));
  const distinct = (field) => [...new Set((options.estates || []).map((estate) => estate[field]).filter(Boolean))].sort();
  return (
    <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: "#f8fafc" }}>
      <Typography fontWeight={800} sx={{ mb: 1 }}>Select real estate through filters</Typography>
      <Grid container spacing={1.5}>
        {["estatetype", "location", "city"].map((field) => (
          <Grid item xs={12} md={3} key={field}>
            <Autocomplete
              options={distinct(field)}
              value={estateFilters[field]}
              onChange={(event, value) => setEstateFilters((prev) => ({ ...prev, [field]: value || "" }))}
              renderInput={(params) => <TextField {...params} label={{ estatetype: "Type", location: "Location", city: "City" }[field]} />}
            />
          </Grid>
        ))}
        <Grid item xs={12} md={3}>
          <Autocomplete
            options={estates}
            getOptionLabel={(option) => `${option.estatename || ""}${option.estatecode ? ` (${option.estatecode})` : ""}`}
            value={estates.find((estate) => String(estate._id) === String(form.estateid)) || null}
            onChange={(event, estate) => setForm((prev) => ({
              ...prev,
              estateid: estate?._id || "",
              estatename: estate?.estatename || "",
              estatecode: estate?.estatecode || "",
              estatetype: estate?.estatetype || "",
              location: estate?.location || ""
            }))}
            renderInput={(params) => <TextField {...params} label="Real estate" />}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function AllocationPage() {
  const config = modules.allocations;
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({ providers: [] });
  const [users, setUsers] = useState([]);
  const [distinct, setDistinct] = useState({});
  const [provider, setProvider] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({ department: "", role: "", designation: "", search: "" });
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get(`${apiBase}/options`, { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };
  const loadUsers = async () => {
    const res = await ep1.get(`${apiBase}/users`, { params: { colid: global1.colid, ...userFilters } });
    setUsers(res.data?.users || []);
    setDistinct(res.data?.distinct || {});
  };
  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get(`${apiBase}/allocations`, { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(messageFrom(err, "Unable to load allocations"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadOptions(); loadUsers(); loadRows(); }, []);

  const save = async () => {
    if (!provider || !selectedUsers.length) {
      setError("Select provider and at least one user.");
      return;
    }
    setWorking(true);
    try {
      const res = await ep1.post(`${apiBase}/allocations/bulk-users`, { ...commonPayload(), providerid: provider._id, employeeemails: selectedUsers.map((user) => user.email) });
      setMessage(`Allocated ${res.data?.inserted || 0} service personnel.`);
      setSelectedUsers([]);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(messageFrom(err, "Unable to allocate users"));
    } finally {
      setWorking(false);
    }
  };
  const deleteRow = async (row) => {
    if (!window.confirm("Delete this allocation?")) return;
    setWorking(true);
    try {
      await ep1.post(`${apiBase}/allocations/delete`, { colid: global1.colid, id: row._id });
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Unable to delete allocation"));
    } finally {
      setWorking(false);
    }
  };
  const columns = [
    ...config.fields.map((field) => ({ field: field.name, headerName: field.label, minWidth: 150, flex: 1 })),
    { field: "actions", type: "actions", headerName: "Actions", getActions: ({ row }) => [<GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(row)} />] }
  ];
  return (
    <MenuPageShell title={config.title}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Hero title={config.title} subtitle={config.subtitle} />
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Autocomplete options={options.providers || []} value={provider} getOptionLabel={(option) => `${option.providername || ""} - ${option.servicetype || ""}`} onChange={(event, value) => setProvider(value)} renderInput={(params) => <TextField {...params} label="Shared service provider" />} />
              </Grid>
              {["department", "role", "designation"].map((field) => (
                <Grid item xs={12} md={2} key={field}>
                  <Autocomplete options={distinct[field] || []} value={userFilters[field]} onChange={(event, value) => setUserFilters((prev) => ({ ...prev, [field]: value || "" }))} renderInput={(params) => <TextField {...params} label={field} />} />
                </Grid>
              ))}
              <Grid item xs={12} md={2}><TextField fullWidth label="Search" value={userFilters.search} onChange={(event) => setUserFilters((prev) => ({ ...prev, search: event.target.value }))} /></Grid>
              <Grid item xs={12} md={2}><Button fullWidth sx={{ height: 56 }} variant="outlined" onClick={loadUsers}>Load users</Button></Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={users}
                  value={selectedUsers}
                  getOptionLabel={(option) => `${option.name || ""} (${option.email || ""})`}
                  onChange={(event, value) => setSelectedUsers(value)}
                  renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option.name} ({option.email})</li>}
                  renderTags={(value, getTagProps) => value.map((option, index) => <Chip label={option.name || option.email} {...getTagProps({ index })} />)}
                  renderInput={(params) => <TextField {...params} label="Select users" />}
                />
              </Grid>
              <Grid item xs={12}><Button variant="contained" startIcon={working ? <CircularProgress size={18} color="inherit" /> : <Save />} disabled={working} onClick={save}>Allocate selected users</Button></Grid>
            </Grid>
          </Paper>
          <DynamicFilterPanel moduleName="allocations" fields={config.fields} filters={filters} setFilters={setFilters} onApply={loadRows} />
          <Paper sx={{ p: 2, borderRadius: 2 }}><Box sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading || working} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} /></Box></Paper>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}

function ShiftPage() {
  const config = modules.shifts;
  const beforeForm = ({ form, setForm, options }) => (
    <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: "#f8fafc" }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={options.allocations || []}
            getOptionLabel={(option) => `${option.employeename || ""} (${option.employeeemail || ""}) - ${option.servicetype || ""}`}
            value={(options.allocations || []).find((item) => item._id === form.allocationid) || null}
            onChange={(event, item) => setForm((prev) => ({ ...prev, allocationid: item?._id || "", servicetype: item?.servicetype || "", employeename: item?.employeename || "", employeeemail: item?.employeeemail || "" }))}
            renderInput={(params) => <TextField {...params} label="Service personnel" />}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={options.shifts || []}
            getOptionLabel={(option) => `${option.location || ""} - ${option.shift || ""} (${option.starttime || ""}-${option.endtime || ""})`}
            value={(options.shifts || []).find((item) => item._id === form.shiftid) || null}
            onChange={(event, item) => setForm((prev) => ({ ...prev, shiftid: item?._id || "", location: item?.location || "", shift: item?.shift || "", starttime: item?.starttime || "", endtime: item?.endtime || "" }))}
            renderInput={(params) => <TextField {...params} label="Master shift" />}
          />
        </Grid>
      </Grid>
    </Box>
  );
  return <CrudModulePage moduleName="shifts" beforeForm={beforeForm} />;
}

function RosterTools({ loadRows, setMessage, setError, setWorking, working, options }) {
  const [form, setForm] = useState({ fromdate: "", todate: "", provider: "Manual", geminiModel: "gemini-2.5-flash", ollamaConfigId: "", prompt: "" });
  const generate = async () => {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post(`${apiBase}/rosters/generate`, { ...commonPayload(), ...form });
      setMessage(`Roster generated. Rows created: ${res.data?.inserted || 0}`);
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Unable to generate roster"));
    } finally {
      setWorking(false);
    }
  };
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>AI assisted roster generation</Typography>
      {working && <LinearProgress sx={{ mb: 2 }} />}
      <Grid container spacing={2}>
        <Grid item xs={12} md={2}><TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="From date" value={form.fromdate} onChange={(e) => setForm((p) => ({ ...p, fromdate: e.target.value }))} /></Grid>
        <Grid item xs={12} md={2}><TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="To date" value={form.todate} onChange={(e) => setForm((p) => ({ ...p, todate: e.target.value }))} /></Grid>
        <Grid item xs={12} md={2}><TextField select fullWidth label="AI provider" value={form.provider} onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))}>{rosterProviders.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
        {form.provider === "Gemini" && <Grid item xs={12} md={2}><TextField select fullWidth label="Gemini model" value={form.geminiModel} onChange={(e) => setForm((p) => ({ ...p, geminiModel: e.target.value }))}>{(options.geminiModels || ["gemini-2.5-flash"]).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>}
        {form.provider === "Ollama" && <Grid item xs={12} md={2}><TextField select fullWidth label="Ollama config" value={form.ollamaConfigId} onChange={(e) => setForm((p) => ({ ...p, ollamaConfigId: e.target.value }))}>{(options.ollamaConfigs || []).map((item) => <MenuItem key={item._id} value={item._id}>{item.name || item.modelname}</MenuItem>)}</TextField></Grid>}
        <Grid item xs={12}><TextField fullWidth multiline minRows={4} label="Additional AI scheduling rules / prompt" value={form.prompt} onChange={(e) => setForm((p) => ({ ...p, prompt: e.target.value }))} placeholder="Example: keep security at gates first, finish electrical work before 2 PM, avoid assigning the same person to distant buildings back to back." /></Grid>
        <Grid item xs={12}><Button variant="contained" startIcon={working ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />} disabled={working} onClick={generate}>Generate daily roster</Button></Grid>
      </Grid>
    </Paper>
  );
}

export const EstateTypesPage = () => <CrudModulePage moduleName="types" />;
export const EstateCampusPage = () => <CrudModulePage moduleName="campuses" />;
export const EstateRealEstatesPage = () => <CrudModulePage moduleName="estates" />;
export const EstateServiceTypesPage = () => <CrudModulePage moduleName="service-types" />;
export const EstateServiceProvidersPage = () => <CrudModulePage moduleName="providers" />;
export const EstateVendorContractsPage = () => <CrudModulePage moduleName="contracts" />;
export const EstateMaintenanceSchedulePage = () => <CrudModulePage moduleName="maintenance" beforeForm={(props) => <EstatePickerPanel {...props} />} />;
export const EstateServiceAllocationPage = AllocationPage;
export const EstateServiceShiftPage = ShiftPage;
export const EstateDailyRosterPage = () => <CrudModulePage moduleName="rosters" rosterTools={(props) => <RosterTools {...props} />} />;

function MeetingRoomFeaturesPage() {
  const featureChoices = ["AV facilities", "Projector", "Sound system", "Others"];
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ feature: "", description: "", status: "Active" });
  const [featureInput, setFeatureInput] = useState("");
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ feature: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get(`${apiBase}/meeting-room-features`, { params });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(messageFrom(err, "Unable to load meeting room features"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const clearForm = () => {
    setEditingId("");
    setForm({ feature: "", description: "", status: "Active" });
    setFeatureInput("");
  };

  const save = async () => {
    try {
      setWorking(true);
      setMessage("");
      setError("");
      await ep1.post(`${apiBase}/meeting-room-features`, { ...commonPayload(), ...form, id: editingId });
      setMessage(editingId ? "Meeting room feature updated." : "Meeting room feature saved.");
      clearForm();
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Unable to save meeting room feature"));
    } finally {
      setWorking(false);
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this meeting room feature?")) return;
    try {
      setWorking(true);
      setError("");
      await ep1.post(`${apiBase}/meeting-room-features-delete`, { colid: global1.colid, id: row._id });
      setMessage("Meeting room feature deleted.");
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Unable to delete meeting room feature"));
    } finally {
      setWorking(false);
    }
  };

  const uploadBulk = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    data.append("user", global1.user);
    data.append("name", global1.name);
    try {
      setWorking(true);
      setMessage("");
      setError("");
      const res = await ep1.post(`${apiBase}/meeting-room-features-bulkupload`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(`Bulk upload completed. Inserted: ${res.data?.inserted || 0}`);
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Bulk upload failed"));
    } finally {
      setWorking(false);
    }
  };

  const columns = [
    { field: "feature", headerName: "Feature", minWidth: 220, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 320, flex: 1.5 },
    { field: "status", headerName: "Status", minWidth: 140, flex: 0.5 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 120,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => {
          setEditingId(row._id);
          setForm({ feature: row.feature || "", description: row.description || "", status: row.status || "Active" });
          setFeatureInput(row.feature || "");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Meeting Room Features">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Hero title="Meeting Room Features" subtitle="Maintain reusable meeting room facilities such as AV facilities, projector, sound system and custom entries." />
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {(loading || working) && <LinearProgress />}
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>Dynamic filters</Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  freeSolo
                  options={featureChoices}
                  inputValue={filters.feature}
                  onInputChange={(event, value) => setFilters((prev) => ({ ...prev, feature: value || "" }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Feature"
                      size="small"
                      onKeyDown={(event) => event.stopPropagation()}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth size="small" label="Status" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {statusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth variant="contained" startIcon={<Refresh />} onClick={loadRows}>Apply</Button>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  freeSolo
                  options={featureChoices}
                  value={null}
                  inputValue={featureInput}
                  onInputChange={(event, value) => {
                    setFeatureInput(value || "");
                    setForm((prev) => ({ ...prev, feature: value || "" }));
                  }}
                  onChange={(event, value) => {
                    const selected = value || featureInput || "";
                    setFeatureInput(selected);
                    setForm((prev) => ({ ...prev, feature: selected }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Feature"
                      required
                      onKeyDown={(event) => event.stopPropagation()}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField fullWidth label="Description" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Status" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
                  {statusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button variant="contained" startIcon={working ? <CircularProgress size={18} color="inherit" /> : <Save />} disabled={working} onClick={save}>{editingId ? "Update" : "Save"}</Button>
                  <Button variant="outlined" onClick={clearForm}>Clear</Button>
                  <Button variant="outlined" startIcon={<FileDownload />} onClick={() => downloadXlsx(modules["meeting-features"].template, "meeting_room_features_template.xlsx", "Meeting Room Features")}>Download template</Button>
                  <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={working}>Bulk upload<input hidden type="file" accept=".xlsx,.xls" onChange={uploadBulk} /></Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ height: 600, width: "100%", overflowX: "auto" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading || working}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "meeting_room_features" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}

function MeetingRoomPage() {
  const config = modules["meeting-rooms"];
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ buildingid: "", building: "", location: "", roomname: "", roomcode: "", ownername: "", owneremail: "", capacity: "", features: [], status: "Active" });
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get(`${apiBase}/options`, { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };
  const loadUsers = async (search = "") => {
    const res = await ep1.get(`${apiBase}/users`, { params: { colid: global1.colid, search } });
    setUsers(res.data?.users || []);
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get(`${apiBase}/meeting-rooms`, { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(messageFrom(err, "Unable to load meeting rooms"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadOptions(); loadUsers(); loadRows(); }, []);

  const save = async () => {
    try {
      setWorking(true);
      await ep1.post(`${apiBase}/meeting-rooms`, { ...commonPayload(), ...form, id: editingId });
      setMessage(editingId ? "Meeting room updated." : "Meeting room saved.");
      setEditingId("");
      setForm({ buildingid: "", building: "", location: "", roomname: "", roomcode: "", ownername: "", owneremail: "", capacity: "", features: [], status: "Active" });
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(messageFrom(err, "Unable to save meeting room"));
    } finally {
      setWorking(false);
    }
  };
  const deleteRow = async (row) => {
    if (!window.confirm("Delete this meeting room?")) return;
    try {
      setWorking(true);
      await ep1.post(`${apiBase}/meeting-rooms/delete`, { colid: global1.colid, id: row._id });
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Unable to delete meeting room"));
    } finally {
      setWorking(false);
    }
  };
  const uploadBulk = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    data.append("user", global1.user);
    data.append("name", global1.name);
    try {
      setWorking(true);
      const res = await ep1.post(`${apiBase}/meeting-rooms/bulkupload`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(`Bulk upload completed. Inserted: ${res.data?.inserted || 0}`);
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Bulk upload failed"));
    } finally {
      setWorking(false);
    }
  };
  const featureOptions = (options.meetingFeatures || []).map((item) => item.feature).filter(Boolean);
  const columns = [
    ...config.fields.map((field) => ({ field: field.name, headerName: field.label, minWidth: field.name === "features" ? 230 : 150, flex: 1, valueGetter: field.name === "features" ? (params) => (params.row.features || []).join(", ") : undefined })),
    { field: "actions", type: "actions", headerName: "Actions", getActions: ({ row }) => [
      <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...row, features: Array.isArray(row.features) ? row.features : [] }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
      <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(row)} />
    ] }
  ];
  return (
    <MenuPageShell title="Meeting Rooms">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Hero title={config.title} subtitle={config.subtitle} />
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          <DynamicFilterPanel moduleName="meeting-rooms" fields={config.fields} filters={filters} setFilters={setFilters} onApply={loadRows} />
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={options.estates || []}
                  getOptionLabel={(item) => `${item.estatename || ""}${item.location ? ` - ${item.location}` : ""}`}
                  value={(options.estates || []).find((item) => item._id === form.buildingid) || null}
                  onChange={(event, item) => setForm((prev) => ({ ...prev, buildingid: item?._id || "", building: item?.estatename || "", location: item?.location || "" }))}
                  renderInput={(params) => <TextField {...params} label="Building from estate" />}
                />
              </Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Location" value={form.location || ""} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Meeting room" value={form.roomname || ""} onChange={(e) => setForm((p) => ({ ...p, roomname: e.target.value }))} /></Grid>
              <Grid item xs={12} md={1.5}><TextField fullWidth label="Room code" value={form.roomcode || ""} onChange={(e) => setForm((p) => ({ ...p, roomcode: e.target.value }))} /></Grid>
              <Grid item xs={12} md={1.5}><TextField fullWidth type="number" label="Capacity" value={form.capacity || ""} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} /></Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={users}
                  getOptionLabel={(item) => `${item.name || ""} (${item.email || ""})`}
                  onInputChange={(event, value) => loadUsers(value)}
                  value={users.find((item) => item.email === form.owneremail) || null}
                  onChange={(event, item) => setForm((p) => ({ ...p, ownername: item?.name || "", owneremail: item?.email || "" }))}
                  renderInput={(params) => <TextField {...params} label="Owner" />}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  freeSolo
                  options={featureOptions}
                  value={form.features || []}
                  onChange={(event, value) => setForm((p) => ({ ...p, features: value }))}
                  renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option}</li>}
                  renderInput={(params) => <TextField {...params} label="Features" />}
                />
              </Grid>
              <Grid item xs={12} md={3}><TextField select fullWidth label="Status" value={form.status || "Active"} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>{statusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button variant="contained" disabled={working} startIcon={working ? <CircularProgress size={18} color="inherit" /> : <Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button>
                  <Button variant="outlined" onClick={() => { setEditingId(""); setForm({ buildingid: "", building: "", location: "", roomname: "", roomcode: "", ownername: "", owneremail: "", capacity: "", features: [], status: "Active" }); }}>Clear</Button>
                  <Button variant="outlined" startIcon={<FileDownload />} onClick={() => downloadXlsx(modules["meeting-rooms"].template, "meeting_room_template.xlsx", "Meeting Rooms")}>Template</Button>
                  <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={working}>Bulk upload<input hidden type="file" accept=".xlsx,.xls" onChange={uploadBulk} /></Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 2, borderRadius: 2 }}><Box sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading || working} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} /></Box></Paper>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}

const toDateText = (date) => date.toISOString().slice(0, 10);
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

function PlannerCalendar({ rows, viewMode, selectedDate }) {
  const base = selectedDate ? new Date(selectedDate) : new Date();
  const dates = viewMode === "Daily"
    ? [toDateText(base)]
    : viewMode === "Weekly"
      ? Array.from({ length: 7 }, (_, i) => toDateText(addDays(base, i)))
      : Array.from({ length: 31 }, (_, i) => toDateText(addDays(new Date(base.getFullYear(), base.getMonth(), 1), i))).filter((date) => new Date(date).getMonth() === base.getMonth());
  return (
    <Grid container spacing={1.2}>
      {dates.map((date) => {
        const dayRows = rows.filter((row) => row.bookingdate === date).sort((a, b) => String(a.fromtime || "").localeCompare(String(b.fromtime || "")));
        return (
          <Grid item xs={12} md={viewMode === "Daily" ? 12 : viewMode === "Weekly" ? 12 / 7 : 12 / 7} key={date}>
            <Paper sx={{ p: 1, minHeight: viewMode === "Monthly" ? 145 : 220, borderRadius: 1.5, bgcolor: dayRows.length ? "#eff6ff" : "#fff", border: "1px solid #dbeafe" }}>
              <Typography fontWeight={900} fontSize={13}>{date}</Typography>
              <Stack spacing={0.7} sx={{ mt: 1 }}>
                {dayRows.map((row) => (
                  <Box key={row._id} sx={{ p: 0.8, borderRadius: 1, bgcolor: "#fff", borderLeft: "4px solid #2563eb", boxShadow: "0 1px 4px rgba(15,23,42,.08)" }}>
                    <Typography fontWeight={800} fontSize={12}>{row.fromtime}-{row.totime}</Typography>
                    <Typography fontSize={12}>{row.roomname}</Typography>
                    <Typography fontSize={11} color="text.secondary">{row.meetingtitle}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}

function MeetingRoomPlannerPage() {
  const [options, setOptions] = useState({});
  const [availableRooms, setAvailableRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState({ building: "", bookingdate: toDateText(new Date()), fromtime: "09:00", totime: "10:00", capacity: "", features: [] });
  const [booking, setBooking] = useState({ roomid: "", meetingtitle: "", purpose: "", sharedservices: [], sharedservicedetails: [], status: "Booked" });
  const [editingBookingId, setEditingBookingId] = useState("");
  const [viewMode, setViewMode] = useState("Weekly");
  const [calendarDate, setCalendarDate] = useState(toDateText(new Date()));
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get(`${apiBase}/options`, { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };
  const loadBookings = async () => {
    const res = await ep1.get(`${apiBase}/meeting-bookings`, { params: { colid: global1.colid } });
    setBookings(res.data?.data || []);
  };
  const searchRooms = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get(`${apiBase}/meeting-rooms-search`, { params: { colid: global1.colid, ...search, features: (search.features || []).join(",") } });
      setAvailableRooms(res.data?.data || []);
      setBooking((prev) => ({ ...prev, roomid: "" }));
    } catch (err) {
      setError(messageFrom(err, "Unable to search meeting rooms"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadOptions(); loadBookings(); searchRooms(); }, []);

  const selectedRoom = availableRooms.find((room) => room._id === booking.roomid)
    || (editingBookingId ? (options.meetingRooms || []).find((room) => room._id === booking.roomid) : null)
    || null;
  const featureOptions = (options.meetingFeatures || []).map((item) => item.feature).filter(Boolean);
  const serviceOptions = (options.serviceTypes || []).map((item) => item.servicetype).filter(Boolean);
  const updateSharedServices = (value) => {
    setBooking((prev) => ({
      ...prev,
      sharedservices: value,
      sharedservicedetails: value.map((service) => {
        const existing = (prev.sharedservicedetails || []).find((item) => item.service === service);
        return { service, noofpeople: existing?.noofpeople || 1 };
      })
    }));
  };
  const updateSharedServicePeople = (service, noofpeople) => {
    setBooking((prev) => ({
      ...prev,
      sharedservicedetails: (prev.sharedservicedetails || []).map((item) => (
        item.service === service ? { ...item, noofpeople } : item
      ))
    }));
  };

  const clearBookingForm = () => {
    setEditingBookingId("");
    setBooking({ roomid: "", meetingtitle: "", purpose: "", sharedservices: [], sharedservicedetails: [], status: "Booked" });
  };

  const saveBooking = async () => {
    if (!selectedRoom) {
      setError("Select an available meeting room.");
      return;
    }
    try {
      setWorking(true);
      setError("");
      const payload = {
        ...commonPayload(),
        ...booking,
        id: editingBookingId,
        roomid: selectedRoom._id,
        roomname: selectedRoom.roomname,
        roomcode: selectedRoom.roomcode,
        building: selectedRoom.building,
        location: selectedRoom.location,
        bookedbyname: global1.name,
        bookedbyemail: global1.user,
        bookingdate: search.bookingdate,
        fromtime: search.fromtime,
        totime: search.totime,
        capacityrequired: search.capacity,
        featuresrequired: search.features
      };
      await ep1.post(`${apiBase}/meeting-bookings-save`, payload);
      setMessage(editingBookingId ? "Meeting room booking updated." : "Meeting room booked.");
      clearBookingForm();
      await loadBookings();
      await searchRooms();
    } catch (err) {
      setError(messageFrom(err, "Unable to book meeting room"));
    } finally {
      setWorking(false);
    }
  };

  const editBooking = (row) => {
    const serviceDetails = row.sharedservicedetails?.length
      ? row.sharedservicedetails
      : (row.sharedservices || []).map((service) => ({ service, noofpeople: 1 }));
    setEditingBookingId(row._id);
    setSearch((prev) => ({
      ...prev,
      building: row.building || "",
      bookingdate: row.bookingdate || prev.bookingdate,
      fromtime: row.fromtime || prev.fromtime,
      totime: row.totime || prev.totime,
      capacity: row.capacityrequired || "",
      features: row.featuresrequired || []
    }));
    setBooking({
      roomid: row.roomid || "",
      meetingtitle: row.meetingtitle || "",
      purpose: row.purpose || "",
      sharedservices: serviceDetails.map((item) => item.service).filter(Boolean),
      sharedservicedetails: serviceDetails,
      status: row.status || "Booked"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteBooking = async (row) => {
    if (!window.confirm("Delete this meeting booking?")) return;
    try {
      setWorking(true);
      setError("");
      await ep1.post(`${apiBase}/meeting-bookings/delete`, { colid: global1.colid, id: row._id });
      setMessage("Meeting booking deleted.");
      await loadBookings();
      await searchRooms();
    } catch (err) {
      setError(messageFrom(err, "Unable to delete meeting booking"));
    } finally {
      setWorking(false);
    }
  };

  const uploadBookings = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    data.append("user", global1.user);
    data.append("name", global1.name);
    try {
      setWorking(true);
      setError("");
      const res = await ep1.post(`${apiBase}/meeting-bookings-bulkupload`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(`Bulk upload completed. Inserted: ${res.data?.inserted || 0}. Skipped: ${res.data?.skipped || 0}`);
      await loadBookings();
      await searchRooms();
    } catch (err) {
      setError(messageFrom(err, "Bulk upload failed"));
    } finally {
      setWorking(false);
    }
  };

  const roomColumns = [
    { field: "roomname", headerName: "Room", minWidth: 170, flex: 1 },
    { field: "building", headerName: "Building", minWidth: 180, flex: 1 },
    { field: "location", headerName: "Location", minWidth: 150, flex: 1 },
    { field: "capacity", headerName: "Capacity", minWidth: 110 },
    { field: "features", headerName: "Features", minWidth: 240, flex: 1, valueGetter: (params) => (params.row.features || []).join(", ") }
  ];
  const bookingColumns = [
    { field: "bookingdate", headerName: "Date", minWidth: 120 },
    { field: "roomname", headerName: "Room", minWidth: 170, flex: 1 },
    { field: "meetingtitle", headerName: "Meeting", minWidth: 180, flex: 1 },
    { field: "fromtime", headerName: "From", minWidth: 100 },
    { field: "totime", headerName: "To", minWidth: 100 },
    { field: "sharedservices", headerName: "Services", minWidth: 220, flex: 1, valueGetter: (params) => {
      const details = params.row.sharedservicedetails || [];
      return details.length ? details.map((item) => `${item.service} (${item.noofpeople || 1})`).join(", ") : (params.row.sharedservices || []).join(", ");
    } },
    { field: "bookedbyname", headerName: "Booked by", minWidth: 160, flex: 1 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "actions", type: "actions", headerName: "Actions", minWidth: 120, getActions: ({ row }) => [
      <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editBooking(row)} />,
      <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteBooking(row)} />
    ] }
  ];
  return (
    <MenuPageShell title="Meeting Room Planner">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Hero title="Meeting Room Planner" subtitle="Search meeting rooms by capacity, time and facilities, then book and view them in calendar." />
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2.4}><Autocomplete freeSolo options={[...new Set((options.meetingRooms || []).map((r) => r.building).filter(Boolean))]} value={search.building} onInputChange={(e, v) => setSearch((p) => ({ ...p, building: v || "" }))} renderInput={(params) => <TextField {...params} label="Building" />} /></Grid>
              <Grid item xs={12} md={1.8}><TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="Date" value={search.bookingdate} onChange={(e) => setSearch((p) => ({ ...p, bookingdate: e.target.value }))} /></Grid>
              <Grid item xs={6} md={1.4}><TextField fullWidth type="time" InputLabelProps={{ shrink: true }} label="From time" value={search.fromtime} onChange={(e) => setSearch((p) => ({ ...p, fromtime: e.target.value }))} /></Grid>
              <Grid item xs={6} md={1.4}><TextField fullWidth type="time" InputLabelProps={{ shrink: true }} label="To time" value={search.totime} onChange={(e) => setSearch((p) => ({ ...p, totime: e.target.value }))} /></Grid>
              <Grid item xs={12} md={1.4}><TextField fullWidth type="number" label="Capacity" value={search.capacity} onChange={(e) => setSearch((p) => ({ ...p, capacity: e.target.value }))} /></Grid>
              <Grid item xs={12} md={3}>
                <Autocomplete multiple disableCloseOnSelect options={featureOptions} value={search.features} onChange={(e, value) => setSearch((p) => ({ ...p, features: value }))} renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option}</li>} renderInput={(params) => <TextField {...params} label="Features" />} />
              </Grid>
              <Grid item xs={12} md={0.6}><Button fullWidth variant="contained" disabled={loading} onClick={searchRooms}>Search</Button></Grid>
            </Grid>
          </Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} lg={7}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography fontWeight={900} sx={{ mb: 1 }}>Available rooms</Typography>
                <Box sx={{ height: 360 }}><DataGrid rows={availableRooms} columns={roomColumns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} onRowClick={(params) => setBooking((p) => ({ ...p, roomid: params.row._id }))} pageSizeOptions={[10, 25, 50, 100]} /></Box>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={5}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography fontWeight={900} sx={{ mb: 1 }}>Book selected room</Typography>
                <Stack spacing={2}>
                  <TextField label="Selected room" value={selectedRoom ? `${selectedRoom.roomname} - ${selectedRoom.building}` : ""} InputProps={{ readOnly: true }} />
                  <TextField label="Meeting title" value={booking.meetingtitle} onChange={(e) => setBooking((p) => ({ ...p, meetingtitle: e.target.value }))} />
                  <Autocomplete multiple disableCloseOnSelect options={serviceOptions} value={booking.sharedservices} onChange={(e, value) => updateSharedServices(value)} renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option}</li>} renderInput={(params) => <TextField {...params} label="Shared services required" />} />
                  {!!booking.sharedservices.length && (
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <Typography fontWeight={800} sx={{ mb: 1 }}>People required for each service</Typography>
                      <Grid container spacing={1.5}>
                        {(booking.sharedservicedetails || []).map((item) => (
                          <Grid item xs={12} sm={6} key={item.service}>
                            <TextField
                              fullWidth
                              type="number"
                              label={item.service}
                              value={item.noofpeople || 1}
                              inputProps={{ min: 1 }}
                              onChange={(event) => updateSharedServicePeople(item.service, Math.max(1, Number(event.target.value || 1)))}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  <TextField multiline minRows={3} label="Purpose" value={booking.purpose} onChange={(e) => setBooking((p) => ({ ...p, purpose: e.target.value }))} />
                  <TextField select label="Status" value={booking.status || "Booked"} onChange={(e) => setBooking((p) => ({ ...p, status: e.target.value }))}>
                    {["Booked", "Completed", "Cancelled", "Inactive"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button variant="contained" disabled={working || !selectedRoom} startIcon={working ? <CircularProgress size={18} color="inherit" /> : <Save />} onClick={saveBooking}>{editingBookingId ? "Update booking" : "Book meeting room"}</Button>
                    <Button variant="outlined" onClick={clearBookingForm}>Clear</Button>
                    <Button
                      variant="outlined"
                      startIcon={<FileDownload />}
                      onClick={() => downloadXlsx({
                        roomcode: "BR-01",
                        roomname: "Board Room",
                        building: "Main Academic Block",
                        bookingdate: toDateText(new Date()),
                        fromtime: "10:00",
                        totime: "11:00",
                        meetingtitle: "Academic review meeting",
                        capacityrequired: 20,
                        featuresrequired: "Projector,Sound system",
                        sharedservicepeople: "Housekeeping:1,AV facilities:1",
                        purpose: "Review meeting",
                        status: "Booked"
                      }, "meeting_room_bookings_template.xlsx", "Meeting Room Bookings")}
                    >
                      Template
                    </Button>
                    <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={working}>Bulk upload<input hidden type="file" accept=".xlsx,.xls" onChange={uploadBookings} /></Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 2 }}>
              <TextField select label="Calendar view" value={viewMode} onChange={(e) => setViewMode(e.target.value)} sx={{ minWidth: 180 }}>{["Daily", "Weekly", "Monthly"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
              <TextField type="date" label="Calendar date" InputLabelProps={{ shrink: true }} value={calendarDate} onChange={(e) => setCalendarDate(e.target.value)} />
              <Button variant="outlined" onClick={loadBookings}>Refresh calendar</Button>
            </Stack>
            <PlannerCalendar rows={bookings} viewMode={viewMode} selectedDate={calendarDate} />
          </Paper>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>All bookings</Typography>
            <Box sx={{ height: 420 }}><DataGrid rows={bookings} columns={bookingColumns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} /></Box>
          </Paper>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}

export const EstateMeetingRoomFeaturesPage = MeetingRoomFeaturesPage;
export const EstateMeetingRoomsPage = MeetingRoomPage;
export const EstateMeetingRoomPlannerPage = MeetingRoomPlannerPage;

export function EstateDailyRosterReportPage() {
  const [filters, setFilters] = useState({ fromdate: "", todate: "", servicetype: "", estatename: "", employeename: "", status: "" });
  const [rows, setRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [summary, setSummary] = useState({ totalduties: 0, totalhours: 0, personnel: 0, estates: 0, services: 0 });
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOptions = async () => {
    try {
      const res = await ep1.get(`${apiBase}/rosters/options`, { params: { colid: global1.colid } });
      setOptions(res.data?.options || {});
    } catch {
      setOptions({});
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get(`${apiBase}/daily-roster-report`, { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
      setInstitution(res.data?.institution || null);
      setSummary(res.data?.summary || {});
    } catch (err) {
      setError(messageFrom(err, "Unable to load daily roster report"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOptions(); loadReport(); }, []);

  const groupedRows = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row.rosterdate || "No date";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  const columns = [
    { field: "rosterdate", headerName: "Date", minWidth: 120 },
    { field: "servicetype", headerName: "Service", minWidth: 160, flex: 1 },
    { field: "estatename", headerName: "Real estate", minWidth: 190, flex: 1 },
    { field: "location", headerName: "Location", minWidth: 150, flex: 1 },
    { field: "employeename", headerName: "Personnel", minWidth: 180, flex: 1 },
    { field: "employeeemail", headerName: "Email", minWidth: 210, flex: 1 },
    { field: "shift", headerName: "Shift", minWidth: 120 },
    { field: "starttime", headerName: "Start", minWidth: 100 },
    { field: "endtime", headerName: "End", minWidth: 100 },
    { field: "hours", headerName: "Hours", minWidth: 100 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "notes", headerName: "Notes", minWidth: 240, flex: 1 }
  ];

  const filterField = (field, label) => (
    <Autocomplete
      freeSolo
      options={options[field] || []}
      value={filters[field] || ""}
      onInputChange={(event, value) => setFilters((prev) => ({ ...prev, [field]: value }))}
      renderInput={(params) => <TextField {...params} label={label} size="small" />}
    />
  );

  return (
    <MenuPageShell title="Daily Service Roster Report">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <style>{`
          @media print {
            @page { size: A4 landscape; margin: 10mm; }
            body * { visibility: hidden; }
            #estate-roster-report-print, #estate-roster-report-print * { visibility: visible; color: #111827 !important; }
            #estate-roster-report-print { position: absolute; left: 0; top: 0; width: 277mm; box-shadow: none !important; border: none !important; }
            .estate-roster-screen { display: none !important; }
            #estate-roster-report-print table { page-break-inside: auto; }
            #estate-roster-report-print tr { page-break-inside: avoid; page-break-after: auto; }
          }
        `}</style>
        <Stack spacing={2}>
          <Box className="estate-roster-screen">
            <Hero title="Daily Service Roster Report" subtitle="Select a date range and publish the estate service roster in printable format." />
          </Box>
          {error && <Alert className="estate-roster-screen" severity="error" onClose={() => setError("")}>{error}</Alert>}
          <Paper className="estate-roster-screen" sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={12} md={2}><TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }} label="From date" value={filters.fromdate} onChange={(e) => setFilters((p) => ({ ...p, fromdate: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }} label="To date" value={filters.todate} onChange={(e) => setFilters((p) => ({ ...p, todate: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}>{filterField("servicetype", "Service type")}</Grid>
              <Grid item xs={12} md={2}>{filterField("estatename", "Real estate")}</Grid>
              <Grid item xs={12} md={2}>{filterField("employeename", "Personnel")}</Grid>
              <Grid item xs={12} md={1.2}>{filterField("status", "Status")}</Grid>
              <Grid item xs={12} md={0.8}><Button fullWidth variant="contained" disabled={loading} onClick={loadReport}>{loading ? "..." : "Apply"}</Button></Grid>
              <Grid item xs={12}>
                <Button variant="outlined" startIcon={<PrintIcon />} disabled={!rows.length} onClick={() => window.print()}>Print report</Button>
              </Grid>
            </Grid>
          </Paper>
          <Grid container spacing={2} className="estate-roster-screen">
            {[
              ["Duties", summary.totalduties || 0],
              ["Hours", summary.totalhours || 0],
              ["Personnel", summary.personnel || 0],
              ["Real estates", summary.estates || 0],
              ["Services", summary.services || 0]
            ].map(([label, value]) => (
              <Grid item xs={6} md={2.4} key={label}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <Typography color="text.secondary" variant="body2">{label}</Typography>
                  <Typography variant="h5" fontWeight={900}>{value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Paper className="estate-roster-screen" sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ height: 620 }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "daily_service_roster_report" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            </Box>
          </Paper>

          <Paper id="estate-roster-report-print" elevation={0} sx={{ p: 2.5, border: "1px solid #cbd5e1", borderRadius: 2, bgcolor: "#fff" }}>
            <Stack alignItems="center" spacing={0.4} sx={{ textAlign: "center", borderBottom: "2px solid #111827", pb: 1.25, mb: 1.5 }}>
              {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 62, maxWidth: 140, objectFit: "contain" }} />}
              <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
              <Typography variant="body2">{institution?.address || ""}</Typography>
              <Typography variant="h6" fontWeight={900} sx={{ mt: 0.8 }}>Daily Service Roster Report</Typography>
              <Typography variant="body2">{filters.fromdate || "-"} to {filters.todate || "-"} | Printed: {new Date().toLocaleDateString()}</Typography>
            </Stack>
            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              {[
                ["Duties", summary.totalduties || 0],
                ["Hours", summary.totalhours || 0],
                ["Personnel", summary.personnel || 0],
                ["Real estates", summary.estates || 0],
                ["Services", summary.services || 0]
              ].map(([label, value]) => (
                <Grid item xs={2.4} key={label}><Chip label={`${label}: ${value}`} sx={{ width: "100%", borderRadius: 1 }} /></Grid>
              ))}
            </Grid>
            {!rows.length ? (
              <Typography textAlign="center" sx={{ py: 4 }}>No roster found for the selected period.</Typography>
            ) : groupedRows.map(([date, items]) => (
              <Box key={date} sx={{ mb: 1.5, breakInside: "avoid" }}>
                <Typography fontWeight={900} sx={{ bgcolor: "#e2e8f0", px: 1, py: 0.6, border: "1px solid #94a3b8" }}>{date}</Typography>
                <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ bgcolor: "#f1f5f9" }}>
                      {["Service", "Real estate", "Location", "Personnel", "Shift", "Timing", "Hours", "Status", "Notes"].map((head) => (
                        <Box component="th" key={head} sx={{ border: "1px solid #94a3b8", p: 0.6, textAlign: "left" }}>{head}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {items.map((row) => (
                      <Box component="tr" key={row._id}>
                        <Box component="td" sx={{ border: "1px solid #cbd5e1", p: 0.55 }}>{row.servicetype}</Box>
                        <Box component="td" sx={{ border: "1px solid #cbd5e1", p: 0.55 }}>{row.estatename}</Box>
                        <Box component="td" sx={{ border: "1px solid #cbd5e1", p: 0.55 }}>{row.location}</Box>
                        <Box component="td" sx={{ border: "1px solid #cbd5e1", p: 0.55 }}>{row.employeename}<br />{row.employeeemail}</Box>
                        <Box component="td" sx={{ border: "1px solid #cbd5e1", p: 0.55 }}>{row.shift}</Box>
                        <Box component="td" sx={{ border: "1px solid #cbd5e1", p: 0.55 }}>{row.starttime} - {row.endtime}</Box>
                        <Box component="td" sx={{ border: "1px solid #cbd5e1", p: 0.55 }}>{row.hours}</Box>
                        <Box component="td" sx={{ border: "1px solid #cbd5e1", p: 0.55 }}>{row.status}</Box>
                        <Box component="td" sx={{ border: "1px solid #cbd5e1", p: 0.55 }}>{row.notes}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            ))}
          </Paper>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}
