/* HostelReport.jsx */
import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function HostelReport() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: s }, { data: d }] = await Promise.all([
          ep1.get(`/api/v2/hostel/summary?colid=${global1.colid}`),
          ep1.get(`/api/v2/hostel/buildings?colid=${global1.colid}`),
        ]);
        setSummary(s);
        setDetails(d);
      } finally {
        setLoading(false);
      }
    })();
  }, [global1.colid]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  /* KPI cards */
  const cards = [
    { label: "Buildings", value: summary?.totalBuildings },
    { label: "Rooms", value: summary?.totalRooms },
    { label: "Beds Available", value: summary?.bedsAvailable },
  ];

  /* seater pie data */
  const seaterPie = Object.entries(summary?.seaterGroups || {}).map(
    ([beds, count]) => ({ name: `${beds}-Seater`, value: count })
  );

  /* bar chart data */
  const barData = details.map((b) => ({
    name: b.building,
    totalBeds: b.totalBeds,
    occupiedBeds: b.occupiedBeds,
  }));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        p: 3,
      }}
    >
      <Box alignSelf="flex-start" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <ArrowBack
            color="primary"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/hostelbuldingmanager`)}
          />
          <Typography
            variant="body1"
            sx={{ cursor: "pointer", color: "primary.main" }}
            onClick={() => navigate(`/hostelbuldingmanager`)}
          >
            Back to Hostel bulding
          </Typography>
        </Box>
      </Box>

      <Typography variant="h4" gutterBottom>
        Hostel Analytics
      </Typography>

      {/* KPI cards */}
      <Grid container spacing={3} mb={3} justifyContent="center">
        {[
          { label: "Buildings", value: summary?.totalBuildings },
          { label: "Rooms", value: summary?.totalRooms },
          { label: "Beds Available", value: summary?.bedsAvailable },
        ].map((c) => (
          <Grid
            item
            xs={12}
            sm={4}
            key={c.label}
            display="flex"
            justifyContent="center"
          >
            <Paper sx={{ p: 2, textAlign: "center", width: 200 }}>
              <Typography variant="h6">{c.label}</Typography>
              <Typography variant="h4" color="primary">
                {c.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={3} justifyContent="center">
        <Grid item xs={12} md={6} display="flex" justifyContent="center">
          <Paper sx={{ p: 2, width: "100%", maxWidth: 400 }}>
            <Typography variant="h6" mb={1} textAlign="center">
              Room Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={seaterPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {seaterPie?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} display="flex" justifyContent="center">
          <Paper sx={{ p: 2, width: "100%", maxWidth: 400 }}>
            <Typography variant="h6" mb={1} textAlign="center">
              Beds per Building
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalBeds" fill="#8884d8" name="Total Beds" />
                <Bar
                  dataKey="occupiedBeds"
                  fill="#82ca9d"
                  name="Occupied Beds"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Detail table */}
      <TableContainer component={Paper} sx={{ maxWidth: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Building</TableCell>
              <TableCell>Rooms</TableCell>
              <TableCell>Total Beds</TableCell>
              <TableCell>Occupied</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {details.map((r) => (
              <TableRow key={r.building}>
                <TableCell>{r.building}</TableCell>
                <TableCell>{r.rooms}</TableCell>
                <TableCell>{r.totalBeds}</TableCell>
                <TableCell>{r.occupiedBeds}</TableCell>
                <TableCell>{r.availableBeds}</TableCell>
                <TableCell>
                  <Chip
                    label={r.availableBeds > 0 ? "Available" : "Full"}
                    color={r.availableBeds > 0 ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
