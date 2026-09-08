import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Alert, Autocomplete, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = { roomresourceid: "", campus: "", building: "", floor: "", room: "", noofseats: "", status: "Pending", approvalcomments: "" };

export default function ConductExamRoomPage() {
  const [rows, setRows] = useState([]);
  const [roomResources, setRoomResources] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState("");
  const [filters, setFilters] = useState({ campus: "", building: "", room: "", status: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
    loadRoomResources();
  }, []);

  const loadRoomResources = async () => {
    try {
      const res = await ep1.get("/api/v2/neplms/room-resources", { params: { colid: global1.colid } });
      setRoomResources(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load room configuration.");
    }
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/conductexam/rooms", { params });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load rooms.");
    }
  };

  const saveRow = async () => {
    if (!form.campus || !form.building || !form.room || form.noofseats === "") {
      setError("Campus, building, room and no of seats are required.");
      return;
    }
    try {
      setError("");
      await ep1.post("/api/v2/conductexam/rooms", {
        ...form,
        noofseats: Number(form.noofseats),
        status: "Pending",
        id: editId,
        colid: global1.colid,
        user: global1.user
      });
      setMessage(editId ? "Room usage request updated and sent for approval." : "Room usage request created and sent for approval.");
      setForm(blankForm);
      setEditId("");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save room.");
    }
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({
      campus: row.campus || "",
      building: row.building || "",
      floor: row.floor || "",
      room: row.room || "",
      noofseats: row.noofseats ?? "",
      roomresourceid: row.roomresourceid || "",
      status: row.status || "Pending",
      approvalcomments: row.approvalcomments || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectRoomResource = (resource) => {
    setForm({
      ...form,
      roomresourceid: resource?._id || "",
      campus: resource?.campus || "",
      building: resource?.building || "",
      floor: resource?.floor || "",
      room: resource?.roomno || "",
      noofseats: resource ? (Number(resource.examcapacity) || Number(resource.capacity) || 0) : "",
      status: "Pending"
    });
  };

  const approveRoom = async (row, status) => {
    const approvalcomments = window.prompt(`${status} comments`, row.approvalcomments || "") || "";
    try {
      await ep1.post("/api/v2/conductexam/rooms-approve", { id: row._id, colid: global1.colid, status, approvalcomments, user: global1.user });
      setMessage(`Room usage ${status.toLowerCase()}.`);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update room approval.");
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await ep1.post("/api/v2/conductexam/rooms-delete", { id, colid: global1.colid });
      setMessage("Room deleted.");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete room.");
    }
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      { campus: "Main Campus", building: "Academic Block", floor: "1", room: "101", noofseats: 60, status: "Pending" }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rooms");
    XLSX.writeFile(workbook, "conduct_exam_room_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const items = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({
        rowNumber: index + 2,
        campus: row.campus || row.Campus || "",
        building: row.building || row.Building || "",
        floor: row.floor || row.Floor || "",
        room: row.room || row.Room || "",
        noofseats: row.noofseats || row["No of seats"] || row.noOfSeats || "",
        status: row.status || row.Status || "Pending"
      }));
      const res = await ep1.post("/api/v2/conductexam/rooms-bulk", { colid: global1.colid, user: global1.user, items });
      setMessage(`${res.data?.saved || 0} rooms uploaded.`);
      if (res.data?.errors?.length) setError(`${res.data.errors.length} rows could not be uploaded. Please check required fields.`);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload rooms.");
    }
  };

  const columns = useMemo(() => [
    { field: "campus", headerName: "Campus", minWidth: 180, flex: 1 },
    { field: "building", headerName: "Building", minWidth: 180, flex: 1 },
    { field: "floor", headerName: "Floor", width: 100 },
    { field: "room", headerName: "Room", minWidth: 140, flex: 1 },
    { field: "noofseats", headerName: "No of Seats", width: 140, type: "number" },
    { field: "status", headerName: "Approval Status", width: 150 },
    { field: "approvalcomments", headerName: "Approval Comments", width: 220 },
    {
      field: "actions",
      headerName: "Actions",
      width: 340,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="success" onClick={() => approveRoom(params.row, "Approved")}>Approve</Button>
          <Button size="small" color="warning" onClick={() => approveRoom(params.row, "Rejected")}>Reject</Button>
          <Button size="small" color="error" onClick={() => deleteRow(params.row._id)}>Delete</Button>
        </Stack>
      )
    }
  ], []);

  return (
    <MenuPageShell title="Seat Master">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Exam Room Usage Approval</Typography>
              <Typography color="text.secondary">Select rooms from room configuration, auto-populate exam capacity, and approve before allocation.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={downloadTemplate}>Template</Button>
              <Button component="label" variant="contained" startIcon={<UploadFileIcon />}>
                Bulk Upload
                <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={roomResources}
                value={roomResources.find((item) => item._id === form.roomresourceid) || null}
                getOptionLabel={(option) => `${option.campus || ""} / ${option.building || ""} / ${option.floor || ""} / ${option.roomno || ""} (${option.examcapacity || option.capacity || 0} exam seats)`}
                onChange={(_, value) => selectRoomResource(value)}
                renderInput={(params) => <TextField {...params} label="Select Room from Room Configuration" />}
              />
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Campus" value={form.campus} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Building" value={form.building} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth label="Floor" value={form.floor} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth label="Room" value={form.room} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={1}><TextField fullWidth type="number" label="Exam Seats" value={form.noofseats} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={1.5}><Button fullWidth variant="contained" onClick={saveRow} sx={{ height: 56 }}>{editId ? "Update" : "Save"}</Button></Grid>
            {editId && <Grid item xs={12} md={1.5}><Button fullWidth variant="outlined" onClick={() => { setEditId(""); setForm(blankForm); }} sx={{ height: 56 }}>Cancel</Button></Grid>}
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            {Object.keys(filters).map((key) => (
              <Grid item xs={12} md={3} key={key}>
                <TextField select={key === "status"} fullWidth label={key} value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
                  {key === "status" && [<MenuItem key="all" value="">All</MenuItem>, ...["Pending", "Approved", "Rejected"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)]}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => loadRows()} sx={{ height: 56 }}>Filter</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Box sx={{ height: 560 }}>
            <DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} disableRowSelectionOnClick />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
