import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Container, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { ArrowBack, Cancel, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";

const hostelTypes = ["Boys", "Girls", "Mixed"];
const guestTypes = ["Student", "Faculty", "Guests", "Mixed"];
const blankBuilding = { buildingname: "", hosteltype: "Boys", guesttype: "Student", blocks: "", floors: "", status: "Active" };
const blankRoom = { buildingid: "", buildingname: "", hosteltype: "", guesttype: "", block: "", floor: "", roomno: "", roomtype: "", roomrentpermonth: 0, noofbeds: 1, residenttype: "", status: "Active" };
const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const buildingHeaderMap = { buildingname: "buildingname", building: "buildingname", hosteltype: "hosteltype", guesttype: "guesttype", blocks: "blocks", floors: "floors", status: "status" };
const roomHeaderMap = { buildingname: "buildingname", building: "buildingname", block: "block", floor: "floor", roomno: "roomno", roomnumber: "roomno", roomtype: "roomtype", roomrentpermonth: "roomrentpermonth", rent: "roomrentpermonth", noofbeds: "noofbeds", beds: "noofbeds", residenttype: "residenttype", status: "status" };

export default function HostelBuildingRoomPage() {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [buildingForm, setBuildingForm] = useState(blankBuilding);
  const [roomForm, setRoomForm] = useState(blankRoom);
  const [buildingEditId, setBuildingEditId] = useState("");
  const [roomEditId, setRoomEditId] = useState("");
  const [buildingUploadRows, setBuildingUploadRows] = useState([]);
  const [roomUploadRows, setRoomUploadRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { refreshAll(); }, []);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [bRes, rRes] = await Promise.all([
        ep1.get("/api/v2/hostelmapping/buildings", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/hostelmapping/rooms", { params: { colid: global1.colid } })
      ]);
      setBuildings(bRes.data.data || []);
      setRooms(rRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load hostel mapping data");
    } finally {
      setLoading(false);
    }
  };

  const selectedBuilding = useMemo(() => buildings.find((item) => item._id === roomForm.buildingid), [buildings, roomForm.buildingid]);
  const blockOptions = selectedBuilding?.blocks || [];
  const floorOptions = selectedBuilding?.floors || [];

  const selectBuildingForRoom = (id) => {
    const building = buildings.find((item) => item._id === id);
    setRoomForm((prev) => ({
      ...prev,
      buildingid: id,
      buildingname: building?.buildingname || "",
      hosteltype: building?.hosteltype || "",
      guesttype: building?.guesttype || "",
      residenttype: building?.guesttype || "",
      block: "",
      floor: ""
    }));
  };

  const saveBuilding = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...buildingForm, colid: global1.colid, user: global1.user };
      if (buildingEditId) await ep1.post("/api/v2/hostelmapping/building/update", { ...payload, id: buildingEditId });
      else await ep1.post("/api/v2/hostelmapping/building", payload);
      setMessage(buildingEditId ? "Building updated" : "Building created");
      setBuildingForm(blankBuilding);
      setBuildingEditId("");
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save building");
    }
  };

  const saveRoom = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...roomForm, colid: global1.colid, user: global1.user };
      if (roomEditId) await ep1.post("/api/v2/hostelmapping/room/update", { ...payload, id: roomEditId });
      else await ep1.post("/api/v2/hostelmapping/room", payload);
      setMessage(roomEditId ? "Room updated" : "Room created");
      setRoomForm(blankRoom);
      setRoomEditId("");
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save room");
    }
  };

  const deleteBuilding = async (row) => {
    if (!window.confirm(`Delete ${row.buildingname}?`)) return;
    try { await ep1.post("/api/v2/hostelmapping/building/delete", { id: row._id }); refreshAll(); } catch (err) { setError(err.response?.data?.message || "Unable to delete building"); }
  };

  const deleteRoom = async (row) => {
    if (!window.confirm(`Delete room ${row.roomno}?`)) return;
    try { await ep1.post("/api/v2/hostelmapping/room/delete", { id: row._id }); refreshAll(); } catch (err) { setError(err.response?.data?.message || "Unable to delete room"); }
  };

  const downloadTemplate = (type) => {
    const row = type === "building"
      ? { "Building Name": "Hostel A", "Hostel Type": "Boys", "Guest Type": "Student", Blocks: "A,B", Floors: "1,2,3", Status: "Active" }
      : { "Building Name": buildings[0]?.buildingname || "Hostel A", Block: buildings[0]?.blocks?.[0] || "A", Floor: buildings[0]?.floors?.[0] || "1", "Room No": "101", "Room Type": "Single", "Room Rent Per Month": 1000, "No Of Beds": 2, "Resident Type": buildings[0]?.guesttype || "Student", Status: "Active" };
    const ws = XLSX.utils.json_to_sheet([row]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === "building" ? "Buildings" : "Rooms");
    XLSX.writeFile(wb, type === "building" ? "Hostel_Building_Template.xlsx" : "Hostel_Room_Template.xlsx");
  };

  const readExcel = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const map = type === "building" ? buildingHeaderMap : roomHeaderMap;
        const parsed = jsonRows.map((row, index) => {
          const item = { rowNumber: index + 2, colid: global1.colid, user: global1.user, status: "Active" };
          Object.entries(row).forEach(([header, value]) => {
            const mapped = map[normalizeHeader(header)];
            if (mapped) item[mapped] = value;
          });
          return item;
        });
        if (type === "building") setBuildingUploadRows(parsed);
        else setRoomUploadRows(parsed);
        setMessage(`${parsed.length} ${type} rows ready for upload`);
      } catch (err) {
        setError("Unable to read Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const uploadRows = async (type) => {
    const rowsToUpload = type === "building" ? buildingUploadRows : roomUploadRows;
    if (!rowsToUpload.length) {
      setError("Please choose an Excel file first");
      return;
    }
    try {
      const endpoint = type === "building" ? "/api/v2/hostelmapping/building/bulkupload" : "/api/v2/hostelmapping/room/bulkupload";
      const res = await ep1.post(endpoint, { colid: global1.colid, user: global1.user, items: rowsToUpload });
      const errors = res.data.errors || [];
      setMessage(`Inserted ${res.data.inserted || 0} ${type} rows${errors.length ? `, ${errors.length} errors` : ""}`);
      if (errors.length) setError(errors.map((item) => `Row ${item.rowNumber}: ${item.message}`).slice(0, 5).join("; "));
      if (type === "building") setBuildingUploadRows([]);
      else setRoomUploadRows([]);
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    }
  };

  const buildingColumns = [
    { field: "actions", headerName: "Actions", width: 110, renderCell: (params) => <Stack direction="row"><Tooltip title="Edit"><IconButton size="small" onClick={() => { setBuildingEditId(params.row._id); setBuildingForm({ ...params.row, blocks: (params.row.blocks || []).join(", "), floors: (params.row.floors || []).join(", ") }); }}><Edit /></IconButton></Tooltip><Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteBuilding(params.row)}><Delete /></IconButton></Tooltip></Stack> },
    { field: "buildingname", headerName: "Building", width: 180 },
    { field: "hosteltype", headerName: "Hostel Type", width: 130 },
    { field: "guesttype", headerName: "Guest Type", width: 130 },
    { field: "blocksText", headerName: "Blocks", width: 180, valueGetter: (p) => (p.row.blocks || []).join(", ") },
    { field: "floorsText", headerName: "Floors", width: 180, valueGetter: (p) => (p.row.floors || []).join(", ") },
    { field: "status", headerName: "Status", width: 110 }
  ];
  const roomColumns = [
    { field: "actions", headerName: "Actions", width: 110, renderCell: (params) => <Stack direction="row"><Tooltip title="Edit"><IconButton size="small" onClick={() => { setRoomEditId(params.row._id); setRoomForm(params.row); }}><Edit /></IconButton></Tooltip><Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteRoom(params.row)}><Delete /></IconButton></Tooltip></Stack> },
    { field: "buildingname", headerName: "Building", width: 180 },
    { field: "block", headerName: "Block", width: 100 },
    { field: "floor", headerName: "Floor", width: 100 },
    { field: "roomno", headerName: "Room No", width: 120 },
    { field: "roomtype", headerName: "Room Type", width: 140 },
    { field: "roomrentpermonth", headerName: "Rent/Month", width: 130 },
    { field: "noofbeds", headerName: "Beds", width: 90 },
    { field: "occupiedbeds", headerName: "Occupied", width: 110 },
    { field: "vacantbeds", headerName: "Vacant", width: 100 },
    { field: "residenttype", headerName: "Resident Type", width: 140 }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Hostel Buildings and Rooms</Typography>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
      </Stack>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper component="form" onSubmit={saveBuilding} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Building Master</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField required fullWidth label="Building Name" value={buildingForm.buildingname} onChange={(e) => setBuildingForm({ ...buildingForm, buildingname: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField select required fullWidth label="Hostel Type" value={buildingForm.hosteltype} onChange={(e) => setBuildingForm({ ...buildingForm, hosteltype: e.target.value })}>{hostelTypes.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select required fullWidth label="Guest Type" value={buildingForm.guesttype} onChange={(e) => setBuildingForm({ ...buildingForm, guesttype: e.target.value })}>{guestTypes.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2.5}><TextField fullWidth label="Blocks comma separated" value={buildingForm.blocks} onChange={(e) => setBuildingForm({ ...buildingForm, blocks: e.target.value })} /></Grid>
          <Grid item xs={12} md={2.5}><TextField fullWidth label="Floors comma separated" value={buildingForm.floors} onChange={(e) => setBuildingForm({ ...buildingForm, floors: e.target.value })} /></Grid>
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          <Button type="submit" variant="contained" startIcon={<Save />}>{buildingEditId ? "Update" : "Save"}</Button>
          <Button variant="outlined" startIcon={<Cancel />} onClick={() => { setBuildingForm(blankBuilding); setBuildingEditId(""); }}>Cancel</Button>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={() => downloadTemplate("building")}>Building Template</Button>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>Choose Building Excel<input hidden type="file" accept=".xlsx,.xls" onChange={(e) => readExcel(e, "building")} /></Button>
          <Button variant="contained" startIcon={<UploadFile />} onClick={() => uploadRows("building")} disabled={!buildingUploadRows.length}>Upload Buildings {buildingUploadRows.length ? `(${buildingUploadRows.length})` : ""}</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 1, mb: 2 }}><DataGrid rows={buildings.map((x) => ({ ...x, id: x._id }))} columns={buildingColumns} autoHeight loading={loading} slots={{ toolbar: GridToolbar }} /></Paper>

      <Paper component="form" onSubmit={saveRoom} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Room Master</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><FormControl fullWidth required><InputLabel>Building</InputLabel><Select label="Building" value={roomForm.buildingid} onChange={(e) => selectBuildingForRoom(e.target.value)}>{buildings.map((b) => <MenuItem key={b._id} value={b._id}>{b.buildingname}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} md={2}><TextField select required fullWidth label="Block" value={roomForm.block} onChange={(e) => setRoomForm({ ...roomForm, block: e.target.value })}>{blockOptions.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select required fullWidth label="Floor" value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}>{floorOptions.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><TextField required fullWidth label="Room No" value={roomForm.roomno} onChange={(e) => setRoomForm({ ...roomForm, roomno: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField required fullWidth label="Room Type" value={roomForm.roomtype} onChange={(e) => setRoomForm({ ...roomForm, roomtype: e.target.value })} /></Grid>
          <Grid item xs={12} md={1.5}><TextField required fullWidth type="number" label="Beds" value={roomForm.noofbeds} onChange={(e) => setRoomForm({ ...roomForm, noofbeds: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Rent/Month" value={roomForm.roomrentpermonth} onChange={(e) => setRoomForm({ ...roomForm, roomrentpermonth: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth label="Resident Type" value={roomForm.residenttype} InputProps={{ readOnly: true }} /></Grid>
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          <Button type="submit" variant="contained" startIcon={<Save />}>{roomEditId ? "Update" : "Save"}</Button>
          <Button variant="outlined" startIcon={<Cancel />} onClick={() => { setRoomForm(blankRoom); setRoomEditId(""); }}>Cancel</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={refreshAll}>Refresh</Button>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={() => downloadTemplate("room")}>Room Template</Button>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>Choose Room Excel<input hidden type="file" accept=".xlsx,.xls" onChange={(e) => readExcel(e, "room")} /></Button>
          <Button variant="contained" startIcon={<UploadFile />} onClick={() => uploadRows("room")} disabled={!roomUploadRows.length}>Upload Rooms {roomUploadRows.length ? `(${roomUploadRows.length})` : ""}</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}><DataGrid rows={rooms.map((x) => ({ ...x, id: x._id }))} columns={roomColumns} autoHeight loading={loading} slots={{ toolbar: GridToolbar }} sx={{ minWidth: 1500 }} /></Paper>
    </Container>
  );
}
