import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Chip, Container, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { ArrowBack, Print, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const residentTypes = ["", "Student", "Faculty", "Mixed", "Guests"];

export default function HostelVacancyReportPage() {
  const [rooms, setRooms] = useState([]);
  const [residenttype, setResidenttype] = useState("");
  const [loading, setLoading] = useState(false);
  const [institution, setInstitution] = useState(null);

  useEffect(() => { loadInstitution(); loadRooms(); }, []);

  const loadInstitution = async () => {
    try { const res = await ep1.get("/vins", { params: { colid: global1.colid } }); setInstitution(res.data || null); } catch { setInstitution(null); }
  };

  const loadRooms = async () => {
    setLoading(true);
    try {
      const params = { colid: global1.colid };
      if (residenttype) params.residenttype = residenttype;
      const res = await ep1.get("/api/v2/hostelmapping/rooms", { params });
      setRooms(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => ({
    rooms: rooms.length,
    beds: rooms.reduce((sum, row) => sum + (Number(row.noofbeds) || 0), 0),
    occupied: rooms.reduce((sum, row) => sum + (Number(row.occupiedbeds) || 0), 0),
    vacant: rooms.reduce((sum, row) => sum + (Number(row.vacantbeds) || 0), 0)
  }), [rooms]);

  const columns = [
    { field: "buildingname", headerName: "Building", width: 180 },
    { field: "hosteltype", headerName: "Hostel Type", width: 130 },
    { field: "residenttype", headerName: "Resident Type", width: 140 },
    { field: "block", headerName: "Block", width: 100 },
    { field: "floor", headerName: "Floor", width: 100 },
    { field: "roomno", headerName: "Room", width: 110 },
    { field: "roomtype", headerName: "Room Type", width: 150 },
    { field: "roomrentpermonth", headerName: "Rent/Month", width: 130 },
    { field: "noofbeds", headerName: "Beds", width: 90 },
    { field: "occupiedbeds", headerName: "Occupied", width: 110 },
    { field: "vacantbeds", headerName: "Vacant", width: 100 }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <style>{`@media print { @page { size: A4 landscape; margin: 10mm; } body * { visibility: hidden; } #hostel-vacancy-print, #hostel-vacancy-print * { visibility: visible; } #hostel-vacancy-print { position: absolute; left: 0; top: 0; width: 275mm; box-shadow: none !important; } .no-print { display: none !important; } }`}</style>
      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Hostel Vacancy Report</Typography>
        <Stack direction="row" spacing={1}><Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button><Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print</Button></Stack>
      </Stack>

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <TextField select label="Resident Type" value={residenttype} onChange={(e) => setResidenttype(e.target.value)} sx={{ minWidth: 220 }}>
            {residentTypes.map((type) => <MenuItem key={type || "all"} value={type}>{type || "All"}</MenuItem>)}
          </TextField>
          <Button variant="contained" startIcon={<Refresh />} onClick={loadRooms}>Load</Button>
          <Chip label={`Rooms: ${summary.rooms}`} />
          <Chip label={`Beds: ${summary.beds}`} />
          <Chip label={`Occupied: ${summary.occupied}`} />
          <Chip color="success" label={`Vacant: ${summary.vacant}`} />
        </Stack>
      </Paper>

      <Paper id="hostel-vacancy-print" sx={{ p: 2, bgcolor: "#fff" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2, borderBottom: "2px solid #111827", pb: 1 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 64, height: 64, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Hostel Vacancy Report {residenttype ? `- ${residenttype}` : ""}</Typography>
        </Stack>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={3}><Chip sx={{ width: "100%" }} label={`Rooms: ${summary.rooms}`} /></Grid>
          <Grid item xs={3}><Chip sx={{ width: "100%" }} label={`Beds: ${summary.beds}`} /></Grid>
          <Grid item xs={3}><Chip sx={{ width: "100%" }} label={`Occupied: ${summary.occupied}`} /></Grid>
          <Grid item xs={3}><Chip sx={{ width: "100%" }} color="success" label={`Vacant: ${summary.vacant}`} /></Grid>
        </Grid>
        <DataGrid rows={rooms.map((x) => ({ ...x, id: x._id }))} columns={columns} autoHeight loading={loading} slots={{ toolbar: GridToolbar }} disableRowSelectionOnClick />
      </Paper>
    </Container>
  );
}
