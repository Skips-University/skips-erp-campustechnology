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
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

export default function StudentHostelBedApplyPage() {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [buildingId, setBuildingId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [buildingRes, statusRes] = await Promise.all([
        ep1.get("/api/v2/hostel-bed-requests/buildings", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/hostel-bed-requests/my-status", { params: { colid: global1.colid, regno: global1.regno, user: global1.user } })
      ]);
      const buildingRows = buildingRes.data?.data || [];
      setBuildings(buildingRows);
      setStatus(statusRes.data || null);
      if (buildingRows[0]?._id) setBuildingId(buildingRows[0]._id);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load hostel data.");
    } finally {
      setLoading(false);
    }
  };

  const loadBeds = async (selectedBuilding = buildingId) => {
    if (!selectedBuilding) return;
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/hostel-bed-requests/vacant-beds", {
        params: { colid: global1.colid, buildingid: selectedBuilding }
      });
      setRooms(res.data?.data || []);
    } catch (err) {
      setRooms([]);
      setError(err.response?.data?.message || "Unable to load vacant beds.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (buildingId) loadBeds(buildingId);
  }, [buildingId]);

  const hasActiveApplication = useMemo(() => {
    if (status?.assignment) return true;
    return (status?.requests || []).some((item) => ["Pending", "Approved"].includes(item.status));
  }, [status]);

  const applyForBed = async (room, bedno) => {
    if (!window.confirm(`Apply for ${room.buildingname}, Room ${room.roomno}, Bed ${bedno}?`)) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/hostel-bed-requests/apply", {
        colid: global1.colid,
        user: global1.user,
        regno: global1.regno,
        roomid: room._id,
        bedno
      });
      setMessage("Hostel bed request submitted.");
      await loadInitial();
      await loadBeds(buildingId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to apply for bed.");
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => rooms.reduce((acc, room) => {
    const floorKey = room.floor || "NA";
    acc[floorKey] = acc[floorKey] || {};
    acc[floorKey][room.roomno] = acc[floorKey][room.roomno] || [];
    acc[floorKey][room.roomno].push(room);
    return acc;
  }, {}), [rooms]);

  const requestColumns = [
    { field: "buildingname", headerName: "Building", minWidth: 160 },
    { field: "roomno", headerName: "Room", minWidth: 100 },
    { field: "bedno", headerName: "Bed", minWidth: 90 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "comments", headerName: "Comments", minWidth: 240, flex: 1 }
  ];

  return (
    <MenuPageShell title="Hostel Bed Application" menuType="student">
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component="button" underline="hover" onClick={() => navigate("/studentdashboard")}>Dashboard</Link>
          <Typography color="text.secondary">Hostel</Typography>
          <Typography color="text.primary">Apply for bed</Typography>
        </Breadcrumbs>

        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Vacant hostel beds</Typography>
            <Typography color="text.secondary">Select a building and apply for one available bed.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate("/dashmclassenr1stud")}>Back</Button>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Building" value={buildingId} onChange={(e) => setBuildingId(e.target.value)}>
                {buildings.map((building) => <MenuItem key={building._id} value={building._id}>{building.buildingname}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="contained" disabled={loading || !buildingId} onClick={() => loadBeds(buildingId)}>Load vacant beds</Button>
            </Grid>
            <Grid item xs={12} md={5}>
              {status?.assignment && <Alert severity="info">Allocated: {status.assignment.buildingname}, Room {status.assignment.roomno}, Bed {status.assignment.bedno}</Alert>}
              {!status?.assignment && hasActiveApplication && <Alert severity="warning">You already have a pending or approved hostel request.</Alert>}
            </Grid>
          </Grid>
        </Paper>

        {Object.keys(grouped).map((floor) => (
          <Paper key={floor} sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Floor {floor}</Typography>
            <Grid container spacing={2}>
              {Object.entries(grouped[floor]).map(([roomno, roomRows]) => (
                <Grid item xs={12} md={6} lg={4} key={roomno}>
                  {roomRows.map((room) => (
                    <Paper key={room._id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography fontWeight={800}>Room {room.roomno}</Typography>
                        <Chip size="small" color="success" label={`${room.vacantbeds} vacant`} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {room.roomtype || "Room"} | Block {room.block || "NA"} | {room.residenttype || room.guesttype || "Resident"}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {(room.vacantbedslist || []).map((bedno) => (
                          <Button key={bedno} size="small" variant="outlined" disabled={hasActiveApplication || loading} onClick={() => applyForBed(room, bedno)}>
                            Bed {bedno}
                          </Button>
                        ))}
                      </Stack>
                    </Paper>
                  ))}
                </Grid>
              ))}
            </Grid>
          </Paper>
        ))}

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>My hostel requests</Typography>
          <DataGrid
            rows={(status?.requests || []).map((row) => ({ ...row, id: row._id }))}
            columns={requestColumns}
            autoHeight
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
