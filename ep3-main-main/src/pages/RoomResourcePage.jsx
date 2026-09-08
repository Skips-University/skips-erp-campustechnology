import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Cancel, Delete, Download, Edit, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = {
  campus: "",
  building: "",
  floor: "",
  roomno: "",
  capacity: "",
  examcapacity: "",
  type: "Classroom",
  labcourse: "",
  labcoursecode: "",
  roomownername: "",
  roomowneremail: ""
};

const roomTypes = ["Classroom", "Lab", "Seminar hall"];

const columnsBase = [
  { field: "campus", headerName: "Campus", width: 170 },
  { field: "building", headerName: "Building", width: 190 },
  { field: "floor", headerName: "Floor", width: 120 },
  { field: "roomno", headerName: "Room No", width: 130 },
  { field: "capacity", headerName: "Capacity", width: 120, type: "number" },
  { field: "examcapacity", headerName: "Exam Capacity", width: 150, type: "number" },
  { field: "type", headerName: "Type", width: 150 },
  { field: "labcourse", headerName: "Lab Course", width: 200 },
  { field: "labcoursecode", headerName: "Lab Course Code", width: 160 },
  { field: "roomownername", headerName: "Room Owner Name", width: 220 },
  { field: "roomowneremail", headerName: "Room Owner Email", width: 240 }
];

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const norm = (value) => String(value || "").trim().toLowerCase();

export default function RoomResourcePage() {
  const [rows, setRows] = useState([]);
  const [owners, setOwners] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [estateBuildings, setEstateBuildings] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ campus: "", building: "", floor: "", roomno: "", type: "", labcourse: "", labcoursecode: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [roomRes, optionRes] = await Promise.all([
        ep1.get("/api/v2/neplms/room-resources", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/neplms/room-resources/options", { params: { colid: global1.colid } })
      ]);
      setRows(roomRes.data?.data || []);
      setOwners(optionRes.data?.owners || []);
      setCampuses(optionRes.data?.campuses || []);
      setEstateBuildings(optionRes.data?.estateBuildings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load room resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filterOptions = useMemo(() => ({
    campus: uniqueSorted(rows.map((row) => row.campus)),
    building: uniqueSorted(rows.filter((row) => !filters.campus || row.campus === filters.campus).map((row) => row.building)),
    floor: uniqueSorted(rows.filter((row) => (!filters.campus || row.campus === filters.campus) && (!filters.building || row.building === filters.building)).map((row) => row.floor)),
    roomno: uniqueSorted(rows.filter((row) => (!filters.campus || row.campus === filters.campus) && (!filters.building || row.building === filters.building) && (!filters.floor || row.floor === filters.floor)).map((row) => row.roomno)),
    type: uniqueSorted([...roomTypes, ...rows.map((row) => row.type)]),
    labcourse: uniqueSorted(rows.map((row) => row.labcourse)),
    labcoursecode: uniqueSorted(rows.map((row) => row.labcoursecode))
  }), [filters, rows]);

  const filteredRows = useMemo(() => rows.filter((row) => Object.entries(filters).every(([key, value]) => !value || row[key] === value)), [filters, rows]);

  const selectedOwner = useMemo(() => owners.find((owner) => owner.email === form.roomowneremail) || null, [form.roomowneremail, owners]);
  const selectedCampus = useMemo(() => campuses.find((campus) => norm(campus.campus) === norm(form.campus)) || null, [campuses, form.campus]);
  const buildingOptions = useMemo(() => {
    if (!selectedCampus) return [];
    const campusValues = [selectedCampus.campus, selectedCampus.location, selectedCampus._id].map(norm).filter(Boolean);
    return estateBuildings.filter((building) => campusValues.includes(norm(building.location)) || campusValues.includes(norm(building.campus)));
  }, [estateBuildings, selectedCampus]);
  const selectedBuilding = useMemo(() => buildingOptions.find((building) => building.estatename === form.building) || null, [buildingOptions, form.building]);

  const selectOwner = (owner) => {
    setForm((prev) => ({
      ...prev,
      roomownername: owner?.name || "",
      roomowneremail: owner?.email || ""
    }));
  };

  const selectCampus = (campus) => {
    setForm((prev) => ({
      ...prev,
      campus: campus?.campus || "",
      building: ""
    }));
  };

  const selectBuilding = (building) => {
    setForm((prev) => ({
      ...prev,
      building: building?.estatename || ""
    }));
  };

  const resetForm = () => {
    setEditingId("");
    setForm(blankForm);
  };

  const saveRoom = async () => {
    try {
      setError("");
      setMessage("");
      const payload = { ...form, colid: global1.colid, user: global1.user };
      if (editingId) payload.id = editingId;
      await ep1.post("/api/v2/neplms/room-resources", payload);
      setMessage(editingId ? "Room resource updated" : "Room resource added");
      resetForm();
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save room resource");
    }
  };

  const editRoom = (row) => {
    setEditingId(row._id);
    setForm({
      campus: row.campus || "",
      building: row.building || "",
      floor: row.floor || "",
      roomno: row.roomno || "",
      capacity: row.capacity || "",
      examcapacity: row.examcapacity || "",
      type: row.type || "Classroom",
      labcourse: row.labcourse || "",
      labcoursecode: row.labcoursecode || "",
      roomownername: row.roomownername || "",
      roomowneremail: row.roomowneremail || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRoom = async (row) => {
    if (!window.confirm("Delete this room resource?")) return;
    try {
      setError("");
      await ep1.post("/api/v2/neplms/room-resources/delete", { id: row._id, colid: global1.colid });
      setMessage("Room resource deleted");
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete room resource");
    }
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{
      campus: "Main Campus",
      building: "Academic Block",
      floor: "1",
      roomno: "101",
      capacity: 60,
      examcapacity: 30,
      type: "Classroom",
      labcourse: "Computer Science Lab",
      labcoursecode: "CSLAB",
      roomownername: "Owner Name",
      roomowneremail: "owner@example.com"
    }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Room Resources");
    XLSX.writeFile(workbook, "room_resources_template.xlsx");
  };

  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const items = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({ ...row, rowNumber: index + 2 }));
      const res = await ep1.post("/api/v2/neplms/room-resources/bulk", { colid: global1.colid, user: global1.user, items });
      const errors = res.data?.errors || [];
      setMessage(`${res.data?.inserted || 0} room resources uploaded${errors.length ? `, ${errors.length} rows skipped` : ""}`);
      setError(errors.length ? errors.map((item) => `Row ${item.rowNumber}: ${item.message}`).join("; ") : "");
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload room resources");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    ...columnsBase,
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editRoom(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRoom(params.row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Room Configuration">
      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>{editingId ? "Edit Room Resource" : "Add Room Resource"}</Typography>
              <Typography variant="body2" color="text.secondary">Create rooms and map room owners from non-student users.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadAll}>Reload</Button>
              <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Template</Button>
              <Button component="label" variant="contained" startIcon={<UploadFile />}>
                Bulk Upload
                <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadExcel} />
              </Button>
            </Stack>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Autocomplete
                options={campuses}
                value={selectedCampus}
                onChange={(event, value) => selectCampus(value)}
                getOptionLabel={(option) => `${option.campus || ""}${option.location ? ` - ${option.location}` : ""}`}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => <TextField {...params} label="Campus" />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                options={buildingOptions}
                value={selectedBuilding}
                onChange={(event, value) => selectBuilding(value)}
                disabled={!form.campus}
                getOptionLabel={(option) => `${option.estatename || ""}${option.estatecode ? ` (${option.estatecode})` : ""}`}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => <TextField {...params} label="Building" helperText={form.campus ? "Buildings from selected campus" : "Select campus first"} />}
              />
            </Grid>
            {["floor", "roomno"].map((field) => (
              <Grid item xs={12} md={3} key={field}>
                <TextField
                  fullWidth
                  label={field === "roomno" ? "Room No" : field.charAt(0).toUpperCase() + field.slice(1)}
                  value={form[field]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                />
              </Grid>
            ))}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Capacity"
                value={form.capacity}
                onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Exam Capacity"
                value={form.examcapacity}
                onChange={(e) => setForm((prev) => ({ ...prev, examcapacity: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Type"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                {roomTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Lab Course"
                value={form.labcourse}
                onChange={(e) => setForm((prev) => ({ ...prev, labcourse: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Lab Course Code"
                value={form.labcoursecode}
                onChange={(e) => setForm((prev) => ({ ...prev, labcoursecode: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={owners}
                value={selectedOwner}
                onChange={(event, value) => selectOwner(value)}
                getOptionLabel={(option) => `${option.name || ""}${option.email ? ` (${option.email})` : ""}`}
                isOptionEqualToValue={(option, value) => option.email === value.email}
                renderInput={(params) => <TextField {...params} label="Room Owner" />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Room Owner Name" value={form.roomownername} onChange={(e) => setForm((prev) => ({ ...prev, roomownername: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Room Owner Email" value={form.roomowneremail} onChange={(e) => setForm((prev) => ({ ...prev, roomowneremail: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<Save />} onClick={saveRoom}>{editingId ? "Update" : "Save"}</Button>
                {editingId && <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>Cancel</Button>}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
          <Grid container spacing={2}>
            {["campus", "building", "floor", "roomno", "type", "labcourse", "labcoursecode"].map((field) => (
              <Grid item xs={12} md={field === "labcourse" ? 3 : 2} key={field}>
                <TextField
                  select
                  fullWidth
                  label={field === "roomno" ? "Room No" : field === "labcourse" ? "Lab Course" : field === "labcoursecode" ? "Lab Course Code" : field.charAt(0).toUpperCase() + field.slice(1)}
                  value={filters[field]}
                  onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}
                >
                  <MenuItem value="">All</MenuItem>
                  {filterOptions[field].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={filteredRows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "room_resources" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1700 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
