import React, { useEffect, useState } from "react";
import {
  Box, CircularProgress, Paper, Typography, Grid, Chip,
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody
} from "@mui/material";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { useNavigate } from "react-router-dom";

const COLORS = ["#0088FE","#00C49F","#FFBB28","#FF8042","#8884d8","#82ca9d"];

export default function EventReport() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: d } = await ep1.get(`/api/v2/geteventreport?colid=${global1.colid}`);
        setData(d);
      } finally {
        setLoading(false);
      }
    })();
  }, [global1.colid]);

  if (loading)
    return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  const { totalEvents, byType, byDept, timeline, events } = data;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 3,
      }}
    >
      <Typography variant="h4" gutterBottom>Event Analytics</Typography>

      {/* KPI */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5">Total Events: {totalEvents}</Typography>
      </Paper>

      {/* Charts row */}
      <Grid container spacing={4} mb={3} justifyContent="center">
        <Grid item xs={12} md={4} display="flex" justifyContent="center">
          <Paper sx={{ p: 2, width: 300 }}>
            <Typography variant="h6" textAlign="center">By Type</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" label>
                  {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4} display="flex" justifyContent="center">
          <Paper sx={{ p: 2, width: 300 }}>
            <Typography variant="h6" textAlign="center">By Department</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byDept}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4} display="flex" justifyContent="center">
          <Paper sx={{ p: 2, width: 300 }}>
            <Typography variant="h6" textAlign="center">Timeline</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={timeline} dataKey="value" nameKey="name" label>
                  {timeline.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Events table */}
      <TableContainer component={Paper} sx={{ maxWidth: 900 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map(ev => (
              <TableRow key={ev._id}>
                <TableCell>{ev.eventname}</TableCell>
                <TableCell>{ev.department}</TableCell>
                <TableCell>{ev.type}</TableCell>
                <TableCell>{new Date(ev.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={new Date(ev.date) >= new Date() ? "Upcoming" : "Past"}
                    color={new Date(ev.date) >= new Date() ? "success" : "default"}
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