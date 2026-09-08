import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ep1 from "../api/ep1";
import global1 from "./global1";
import PlacementCoordinatorShell from "./PlacementCoordinatorShell";

const isoDate = (date) => new Date(date).toISOString().slice(0, 10);
const today = () => isoDate(new Date());
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
};
const displayDate = (date) => new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });

export default function PlacementVisitCalendarPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState("weekly");
  const [selectedDate, setSelectedDate] = useState(today());
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");

  const colid = global1.colid;

  const range = useMemo(() => {
    if (view === "daily") return { startdate: selectedDate, enddate: selectedDate };
    const start = startOfWeek(selectedDate);
    return { startdate: isoDate(start), enddate: isoDate(addDays(start, 6)) };
  }, [view, selectedDate]);

  const loadUsers = async () => {
    const res = await ep1.get("/api/v2/placement-users", { params: { colid } });
    setUsers(res.data || []);
    const current = (res.data || []).find((u) => u.email === global1.user);
    if (current) setSelectedUser(current);
  };

  const loadPlans = async () => {
    if (!selectedUser?.email) return setPlans([]);
    const res = await ep1.get("/api/v2/placement-visit-plans", {
      params: { colid, assigneduser: selectedUser.email, ...range }
    });
    setPlans(res.data || []);
  };

  useEffect(() => {
    loadUsers().catch((err) => setError(err.response?.data?.msg || err.message));
  }, []);

  useEffect(() => {
    loadPlans().catch((err) => setError(err.response?.data?.msg || err.message));
  }, [selectedUser, range.startdate, range.enddate]);

  const days = useMemo(() => {
    if (view === "daily") return [new Date(selectedDate)];
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [view, selectedDate]);

  const plansByDate = useMemo(() => plans.reduce((acc, plan) => {
    const key = plan.planneddate ? String(plan.planneddate).slice(0, 10) : "";
    if (!acc[key]) acc[key] = [];
    acc[key].push(plan);
    return acc;
  }, {}), [plans]);

  const changePeriod = (direction) => {
    const step = view === "daily" ? 1 : 7;
    setSelectedDate(isoDate(addDays(selectedDate, direction * step)));
  };

  return (
    <PlacementCoordinatorShell title="Placement Visit Calendar">
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Placement Visit Calendar</Typography>
            <Typography variant="body2" color="text.secondary">Select a user and view placement visit plans in daily or weekly calendar view.</Typography>
          </Box>
          <Chip icon={<CalendarMonthIcon />} label={`${plans.length} plan${plans.length === 1 ? "" : "s"}`} color="primary" variant="outlined" />
        </Stack>
        {error && <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>{error}</Alert>}
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2, mt: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={users}
              value={selectedUser}
              onChange={(e, value) => setSelectedUser(value)}
              getOptionLabel={(option) => option ? `${option.name || ""} (${option.email || ""})` : ""}
              renderInput={(params) => <TextField {...params} size="small" label="Select user" />}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" type="date" label="Start date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <ToggleButtonGroup exclusive size="small" value={view} onChange={(e, value) => value && setView(value)}>
              <ToggleButton value="daily">Daily</ToggleButton>
              <ToggleButton value="weekly">Weekly</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
              <Button variant="outlined" onClick={() => changePeriod(-1)}>Previous</Button>
              <Button variant="outlined" onClick={() => setSelectedDate(today())}>Today</Button>
              <Button variant="outlined" onClick={() => changePeriod(1)}>Next</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 2, mt: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: view === "daily" ? "1fr" : "repeat(7, minmax(180px, 1fr))",
            gap: 1.5,
            overflowX: "auto"
          }}
        >
          {days.map((day) => {
            const key = isoDate(day);
            const dayPlans = plansByDate[key] || [];
            return (
              <Paper key={key} variant="outlined" sx={{ minHeight: 420, p: 1.5, bgcolor: "#fbfdff" }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>{displayDate(day)}</Typography>
                <Stack spacing={1}>
                  {dayPlans.length === 0 && (
                    <Typography variant="body2" color="text.secondary">No plans</Typography>
                  )}
                  {dayPlans.map((plan) => (
                    <Paper key={plan._id} sx={{ p: 1.25, borderRadius: 1.5, border: "1px solid #dbeafe", bgcolor: "#ffffff" }}>
                      <Typography variant="subtitle2" fontWeight={800}>{plan.companyname}</Typography>
                      <Typography variant="body2">{plan.leadname} {plan.leadphone ? `| ${plan.leadphone}` : ""}</Typography>
                      {plan.comments && <Typography variant="body2" color="text.secondary">Comments: {plan.comments}</Typography>}
                      {plan.description && <Typography variant="body2" color="text.secondary">Description: {plan.description}</Typography>}
                      {plan.workdone && <Typography variant="body2" sx={{ mt: 0.5 }}>Work done: {plan.workdone}</Typography>}
                      {plan.nextfollowupdate && (
                        <Chip size="small" sx={{ mt: 1 }} label={`Next: ${String(plan.nextfollowupdate).slice(0, 10)}`} />
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            );
          })}
        </Box>
      </Paper>
    </PlacementCoordinatorShell>
  );
}
