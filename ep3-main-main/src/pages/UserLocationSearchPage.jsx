import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ContactMail, Explore, MyLocation, Refresh, Save, Search } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankForm = { user: "", useremail: "", city: "", country: "", latitude: "", longitude: "", published: "Yes" };
const kmMarks = [{ value: 1, label: "1 km" }, { value: 25, label: "25" }, { value: 50, label: "50" }, { value: 100, label: "100" }];
const isStudentRole = (role) => /^student$/i.test(String(role || ""));
const labelUser = (user) => [user?.name, user?.email || user?.user, user?.role].filter(Boolean).join(" | ");

export default function UserLocationSearchPage({ student = false, myOnly = false }) {
  const mode = student ? "student" : "user";
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [searchForm, setSearchForm] = useState({ latitude: "", longitude: "", distanceKm: 10, country: "", city: "", contact: "" });
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [contacting, setContacting] = useState(false);

  const visibleUsers = useMemo(() => users.filter((user) => student ? isStudentRole(user.role) : !isStudentRole(user.role)), [users, student]);
  const countries = useMemo(() => [...new Set(rows.map((row) => row.country).filter(Boolean))].sort(), [rows]);
  const cities = useMemo(() => [...new Set(rows.map((row) => row.city).filter(Boolean))].sort(), [rows]);

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updateSearch = (field, value) => setSearchForm((prev) => ({ ...prev, [field]: value }));

  const showBrowserLocationError = (err) => {
    const detail = err?.message ? `: ${err.message}` : "";
    setError(`Unable to read browser location${detail}`);
  };

  const populateCurrentCoordinates = (target = "form") => {
    setError("");
    if (!navigator.geolocation) {
      setError("Browser location is not available");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const payload = {
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude)
        };
        if (target === "search") {
          setSearchForm((prev) => ({ ...prev, ...payload }));
        } else {
          setForm((prev) => ({ ...prev, ...payload }));
        }
      },
      showBrowserLocationError,
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const loadUsers = async () => {
    if (student || myOnly) return;
    try {
      const res = await ep1.get("/api/v2/hrleave/options", { params: { colid: global1.colid } });
      setUsers(res.data?.users || []);
    } catch {
      setUsers([]);
    }
  };

  const loadCurrentLocation = async (email = global1.user) => {
    if (!email) return;
    try {
      const res = await ep1.get("/api/v2/user-location/current", { params: { colid: global1.colid, useremail: email } });
      const user = res.data?.user || {};
      const location = res.data?.location || {};
      setForm({
        user: location.user || user.name || global1.name || "",
        useremail: location.useremail || user.email || email,
        city: location.city || user.city || "",
        country: location.country || user.country || "",
        latitude: String(location.latitude ?? location.lattitude ?? ""),
        longitude: String(location.longitude ?? ""),
        published: location.published || "Yes"
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load location");
    }
  };

  useEffect(() => {
    loadUsers();
    if (student || myOnly) loadCurrentLocation(global1.user);
  }, [student, myOnly]);

  useEffect(() => {
    if (selectedUser?.email) loadCurrentLocation(selectedUser.email);
  }, [selectedUser?.email]);

  const saveLocation = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const useremail = (student || myOnly) ? global1.user : form.useremail;
      await ep1.post("/api/v2/user-location/save", {
        ...form,
        useremail,
        colid: global1.colid,
        updatedby: global1.user
      });
      setMessage("Location saved");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save location");
    } finally {
      setSaving(false);
    }
  };

  const searchLocations = async () => {
    try {
      setSearching(true);
      setError("");
      setMessage("");
      setSelectedRows([]);
      const res = await ep1.post("/api/v2/user-location/search", {
        ...searchForm,
        colid: global1.colid,
        mode
      });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to search locations");
    } finally {
      setSearching(false);
    }
  };

  const sendContact = async () => {
    try {
      setContacting(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/user-location/contact", {
        colid: global1.colid,
        mode,
        senderemail: global1.user,
        ids: selectedRows
      });
      setMessage(res.data?.message || "Contact email sent");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send contact email");
    } finally {
      setContacting(false);
    }
  };

  const columns = [
    { field: "name", headerName: student ? "Student" : "User", minWidth: 220, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "role", headerName: "Role", minWidth: 130 },
    { field: "city", headerName: "City", minWidth: 140 },
    { field: "country", headerName: "Country", minWidth: 140 },
    { field: "distanceKm", headerName: "Distance (km)", minWidth: 130, valueFormatter: (params) => params.value === undefined || params.value === null ? "" : Number(params.value).toFixed(2) }
  ];

  return (
    <MenuPageShell title={student ? "Location search" : myOnly ? "My location search" : "User search"} menuType={student ? "student" : undefined}>
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2, borderTop: "4px solid #1976d2" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="h5" fontWeight={900}>{student ? "Publish coordinates" : myOnly ? "My location search" : "User search"}</Typography>
              <Typography color="text.secondary" variant="body2">
                Save public location coordinates, search nearby {student ? "students" : "users"}, and send contact emails without exposing email or phone in the table.
              </Typography>
            </Box>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => (student || myOnly) ? loadCurrentLocation(global1.user) : loadUsers()}>Refresh</Button>
          </Stack>
          {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight={900}>Location details</Typography>
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            {!student && !myOnly && (
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={visibleUsers}
                  value={selectedUser}
                  onChange={(_, value) => {
                    setSelectedUser(value);
                    if (value) setForm((prev) => ({ ...prev, user: value.name || "", useremail: value.email || "" }));
                  }}
                  getOptionLabel={labelUser}
                  renderInput={(params) => <TextField {...params} label="Select user" size="small" />}
                />
              </Grid>
            )}
            <Grid item xs={12} md={(student || myOnly) ? 3 : 2}><TextField fullWidth size="small" label="User" value={form.user} InputProps={{ readOnly: student || myOnly }} onChange={(e) => updateForm("user", e.target.value)} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth size="small" label="User email" value={(student || myOnly) ? global1.user : form.useremail} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="City" value={form.city} onChange={(e) => updateForm("city", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Country" value={form.country} onChange={(e) => updateForm("country", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Latitude" value={form.latitude} onChange={(e) => updateForm("latitude", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Longitude" value={form.longitude} onChange={(e) => updateForm("longitude", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Published</InputLabel>
                <Select label="Published" value={form.published} onChange={(e) => updateForm("published", e.target.value)}>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <Button variant="outlined" startIcon={<MyLocation />} onClick={() => populateCurrentCoordinates("form")}>Auto populate lat/long</Button>
                <Button variant="contained" startIcon={<Save />} onClick={saveLocation} disabled={saving || (!student && !myOnly && !form.useremail)}>{saving ? "Saving..." : "Save location"}</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight={900}>Search</Typography>
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="My latitude" value={searchForm.latitude} onChange={(e) => updateSearch("latitude", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="My longitude" value={searchForm.longitude} onChange={(e) => updateSearch("longitude", e.target.value)} /></Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary">Distance: {searchForm.distanceKm} km</Typography>
              <Slider min={1} max={100} value={Number(searchForm.distanceKm)} marks={kmMarks} valueLabelDisplay="auto" onChange={(_, value) => updateSearch("distanceKm", value)} />
            </Grid>
            <Grid item xs={12} md={2}><Autocomplete freeSolo size="small" options={countries} value={searchForm.country} onInputChange={(_, value) => updateSearch("country", value)} onChange={(_, value) => updateSearch("country", value || "")} renderInput={(params) => <TextField {...params} label="Country" />} /></Grid>
            <Grid item xs={12} md={2}><Autocomplete freeSolo size="small" options={cities} value={searchForm.city} onInputChange={(_, value) => updateSearch("city", value)} onChange={(_, value) => updateSearch("city", value || "")} renderInput={(params) => <TextField {...params} label="City" />} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Contact / name / role" value={searchForm.contact} onChange={(e) => updateSearch("contact", e.target.value)} /></Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <Button variant="outlined" startIcon={<Explore />} onClick={() => populateCurrentCoordinates("search")}>Use my coordinates</Button>
                <Button variant="contained" startIcon={<Search />} onClick={searchLocations} disabled={searching}>{searching ? "Searching..." : "Search"}</Button>
                <Button variant="contained" color="secondary" startIcon={<ContactMail />} onClick={sendContact} disabled={contacting || !selectedRows.length}>{contacting ? "Sending..." : "Contact selected"}</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <DataGrid
            autoHeight
            rows={rows}
            getRowId={(row) => row._id}
            columns={columns}
            checkboxSelection
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={(ids) => setSelectedRows(Array.from(ids))}
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            disableRowSelectionOnClick
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
