import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Print, Refresh } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};
const dateToInput = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const startOfWeek = (date) => addDays(date, -date.getDay());
const monthTitle = (year, month) => new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
const shortDate = (date) => date.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
const longDate = (date) => date.toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

function ClassCard({ row }) {
  return (
    <Box sx={{ p: 0.8, borderRadius: 1, bgcolor: "#eef2ff", borderLeft: "4px solid #4f46e5" }}>
      <Typography variant="caption" fontWeight={900} display="block">
        {row.classtime || "-"} | P{row.period || "-"} | {row.coursecode || ""}
      </Typography>
      <Typography variant="caption" display="block">{row.course || row.topic || "-"}</Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {row.programcode || row.program || ""} Sem {row.semester || ""} | {row.faculty || ""}
      </Typography>
    </Box>
  );
}

export default function RoomCalendarPage() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({ campus: "", building: "", floor: "", roomno: "", academicyear: "" });
  const [view, setView] = useState("Monthly");
  const [activeDate, setActiveDate] = useState(dateToInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRooms = async () => {
    try {
      const res = await ep1.get("/api/v2/neplms/room-resources/options", { params: { colid: global1.colid } });
      setRooms(res.data?.rooms || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load room list");
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const roomOptions = useMemo(() => ({
    campus: uniqueSorted(rooms.map((row) => row.campus)),
    building: uniqueSorted(rooms.filter((row) => !filters.campus || row.campus === filters.campus).map((row) => row.building)),
    floor: uniqueSorted(rooms.filter((row) => (!filters.campus || row.campus === filters.campus) && (!filters.building || row.building === filters.building)).map((row) => row.floor)),
    roomno: uniqueSorted(rooms.filter((row) => (!filters.campus || row.campus === filters.campus) && (!filters.building || row.building === filters.building) && (!filters.floor || row.floor === filters.floor)).map((row) => row.roomno)),
    academicyear: uniqueSorted(bookings.map((row) => row.academicyear))
  }), [bookings, filters, rooms]);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid, ...filters };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });
      const res = await ep1.get("/api/v2/neplms/room-calendar", { params });
      setBookings(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load room calendar");
    } finally {
      setLoading(false);
    }
  };

  const selectedDate = parseDate(activeDate) || new Date();
  const dailyItems = useMemo(() => bookings.filter((row) => row.classdate === dateToInput(selectedDate))
    .sort((a, b) => String(a.classtime).localeCompare(String(b.classtime))), [bookings, selectedDate]);

  const weeklyDays = useMemo(() => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index);
      const key = dateToInput(date);
      return {
        key,
        date,
        items: bookings.filter((row) => row.classdate === key).sort((a, b) => String(a.classtime).localeCompare(String(b.classtime)))
      };
    });
  }, [bookings, selectedDate]);

  const monthCells = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i += 1) cells.push({ key: `blank-${i}`, blank: true });
    for (let day = 1; day <= totalDays; day += 1) {
      const dateValue = dateToInput(new Date(year, month, day));
      cells.push({
        key: dateValue,
        day,
        items: bookings.filter((row) => row.classdate === dateValue).sort((a, b) => String(a.classtime).localeCompare(String(b.classtime)))
      });
    }
    while (cells.length % 7 !== 0) cells.push({ key: `blank-end-${cells.length}`, blank: true });
    return { title: monthTitle(year, month), cells };
  }, [bookings, selectedDate]);

  return (
    <MenuPageShell title="Room Calendar">
      <Box sx={{ p: 3 }}>
        <style>
          {`
            @media print {
              @page { size: A4 landscape; margin: 8mm; }
              body * { visibility: hidden; }
              #room-calendar-print, #room-calendar-print * { visibility: visible; }
              #room-calendar-print { position: absolute; left: 0; top: 0; width: 281mm; box-shadow: none !important; border: 0 !important; }
              .no-print { display: none !important; }
            }
          `}
        </style>
        {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>Room Availability</Typography>
              <Typography variant="body2" color="text.secondary">Select a room to see timetable bookings in daily, weekly or monthly calendar view.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadRooms}>Reload Rooms</Button>
              <Button variant="contained" onClick={loadCalendar} disabled={loading}>Apply</Button>
              <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
            </Stack>
          </Stack>
          <Grid container spacing={2}>
            {["campus", "building", "floor", "roomno"].map((field) => (
              <Grid item xs={12} md={2.4} key={field}>
                <TextField
                  select
                  fullWidth
                  label={field === "roomno" ? "Room No" : field.charAt(0).toUpperCase() + field.slice(1)}
                  value={filters[field]}
                  onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value, ...(field === "campus" ? { building: "", floor: "", roomno: "" } : {}), ...(field === "building" ? { floor: "", roomno: "" } : {}), ...(field === "floor" ? { roomno: "" } : {}) }))}
                >
                  <MenuItem value="">All</MenuItem>
                  {roomOptions[field].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md={2.4}>
              <TextField fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters((prev) => ({ ...prev, academicyear: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>View</InputLabel>
                <Select label="View" value={view} onChange={(e) => setView(e.target.value)}>
                  <MenuItem value="Daily">Daily</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="Calendar Date" value={activeDate} onChange={(e) => setActiveDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </Paper>

        <Paper id="room-calendar-print" sx={{ p: 2, bgcolor: "#fff", color: "#111827", border: "1px solid #cbd5e1" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Room Calendar</Typography>
              <Typography variant="body2">
                {[filters.campus, filters.building, filters.floor && `Floor ${filters.floor}`, filters.roomno && `Room ${filters.roomno}`].filter(Boolean).join(" | ") || "All rooms"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`Bookings: ${bookings.length}`} />
              <Chip label={`View: ${view}`} />
            </Stack>
          </Stack>

          {view === "Daily" && (
            <Box sx={{ border: "1px solid #94a3b8" }}>
              <Box sx={{ bgcolor: "#0f172a", color: "#fff", textAlign: "center", py: 1 }}>
                <Typography variant="subtitle1" fontWeight={900}>{longDate(selectedDate)}</Typography>
              </Box>
              <Grid container>
                {dailyItems.length === 0 && <Grid item xs={12} sx={{ p: 2, textAlign: "center" }}>No bookings found.</Grid>}
                {dailyItems.map((row) => (
                  <Grid item xs={12} md={6} key={row._id} sx={{ borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", p: 1 }}>
                    <ClassCard row={row} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {view === "Weekly" && (
            <Box sx={{ border: "1px solid #94a3b8" }}>
              <Box sx={{ bgcolor: "#0f172a", color: "#fff", textAlign: "center", py: 1 }}>
                <Typography variant="subtitle1" fontWeight={900}>{shortDate(weeklyDays[0]?.date)} - {shortDate(weeklyDays[6]?.date)}</Typography>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {weeklyDays.map((day) => (
                  <Box key={day.key} sx={{ minHeight: 170, p: 0.75, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                    <Typography variant="caption" fontWeight={900} display="block" sx={{ mb: 0.7 }}>{weekdayLabels[day.date.getDay()]}, {shortDate(day.date)}</Typography>
                    <Stack spacing={0.5}>
                      {day.items.length === 0 && <Typography variant="caption" color="text.secondary">Available</Typography>}
                      {day.items.map((row) => <ClassCard key={row._id} row={row} />)}
                    </Stack>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {view === "Monthly" && (
            <Box sx={{ border: "1px solid #94a3b8" }}>
              <Box sx={{ bgcolor: "#0f172a", color: "#fff", textAlign: "center", py: 1 }}>
                <Typography variant="subtitle1" fontWeight={900}>{monthCells.title}</Typography>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {weekdayLabels.map((label) => (
                  <Box key={label} sx={{ bgcolor: "#e2e8f0", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.65, textAlign: "center" }}>
                    <Typography variant="caption" fontWeight={900}>{label}</Typography>
                  </Box>
                ))}
                {monthCells.cells.map((cell) => (
                  <Box key={cell.key} sx={{ minHeight: 120, p: 0.6, bgcolor: cell.blank ? "#f8fafc" : "#fff", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                    {!cell.blank && (
                      <>
                        <Typography variant="caption" fontWeight={900} display="block" sx={{ mb: 0.5 }}>{cell.day}</Typography>
                        <Stack spacing={0.45}>
                          {cell.items.length === 0 && <Typography variant="caption" color="text.secondary">Available</Typography>}
                          {cell.items.map((row) => <ClassCard key={row._id} row={row} />)}
                        </Stack>
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
