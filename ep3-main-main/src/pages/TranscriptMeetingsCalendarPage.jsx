import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EventIcon from "@mui/icons-material/Event";
import GoogleIcon from "@mui/icons-material/Google";
import MicIcon from "@mui/icons-material/Mic";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import ep1 from "../api/ep1";
import global1 from "./global1";
import PlacementCoordinatorShell from "./PlacementCoordinatorShell";

const pad = (value) => String(value).padStart(2, "0");
const localDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const localDateTime = (date) => `${localDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
const parseDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const startOfWeek = (date) => addDays(date, -date.getDay());
const endOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};
const sameDay = (a, b) => localDate(parseDate(a)) === localDate(parseDate(b));
const currentEmail = () => String(global1.email || global1.user || "").trim().toLowerCase();
const text = (value) => String(value || "");
const escapeHtml = (value) => text(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));
const paragraphHtml = (value) => escapeHtml(value || "").split("\n").map((line) => `<p>${line || "&nbsp;"}</p>`).join("");

const googleDate = (value) => parseDate(value).toISOString().replace(/[-:]|\.\d{3}/g, "");

const buildGoogleCalendarUrl = (form) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: form.topic || "Meeting",
    dates: `${googleDate(form.startDateTime)}/${googleDate(form.endDateTime)}`,
    details: [form.description, form.meetingLink ? `Meeting link: ${form.meetingLink}` : ""].filter(Boolean).join("\n\n"),
    add: (form.participants || []).map((item) => item.email).filter(Boolean).join(",")
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const buildMinutesHtml = (meeting, institution) => {
  const participants = (meeting?.participants || []).map((item) => `${item.name || ""}${item.email ? ` (${item.email})` : ""}`).join(", ");
  return `<!doctype html><html><head><title>Meeting Minutes</title><style>
  @page{size:A4;margin:16mm} body{font-family:Arial,sans-serif;color:#111827;font-size:12px;line-height:1.45}
  .header{text-align:center;border-bottom:1px solid #111827;padding-bottom:10px;margin-bottom:14px}
  .logo{max-height:72px;max-width:110px;object-fit:contain;margin-bottom:6px}
  h1{font-size:20px;margin:4px 0} h2{font-size:15px;margin:14px 0 6px;border-bottom:1px solid #d1d5db;padding-bottom:4px}
  table{width:100%;border-collapse:collapse;margin-bottom:10px} td{border:1px solid #d1d5db;padding:6px;vertical-align:top;color:#111827}
  td:first-child{width:28%;font-weight:700;background:#f9fafb} a{color:#111827;word-break:break-all}.section{page-break-inside:avoid}
  </style></head><body>
  <div class="header">${institution?.logolink ? `<img class="logo" src="${escapeHtml(institution.logolink)}" />` : ""}<h1>${escapeHtml(institution?.institutionname || global1.insname || "Institution")}</h1><div>${escapeHtml(institution?.address || "")}</div></div>
  <h1>Meeting Minutes</h1>
  <table><tbody>
  <tr><td>Title</td><td>${escapeHtml(meeting?.topic)}</td></tr>
  <tr><td>Date and Time</td><td>${escapeHtml(parseDate(meeting?.startDateTime).toLocaleString())} - ${escapeHtml(parseDate(meeting?.endDateTime).toLocaleString())}</td></tr>
  <tr><td>Host</td><td>${escapeHtml(meeting?.hostName)} (${escapeHtml(meeting?.hostEmail)})</td></tr>
  <tr><td>Participants</td><td>${escapeHtml(participants)}</td></tr>
  <tr><td>Meeting Link</td><td>${meeting?.meetingLink ? `<a href="${escapeHtml(meeting.meetingLink)}">${escapeHtml(meeting.meetingLink)}</a>` : ""}</td></tr>
  <tr><td>Audio Link</td><td>${meeting?.audioUrl ? `<a href="${escapeHtml(meeting.audioUrl)}">${escapeHtml(meeting.audioUrl)}</a>` : ""}</td></tr>
  </tbody></table>
  <div class="section"><h2>Summary</h2>${paragraphHtml(meeting?.summary)}</div>
  <div class="section"><h2>Action Items</h2>${paragraphHtml(meeting?.actionItems)}</div>
  <div class="section"><h2>Transcript</h2>${paragraphHtml(meeting?.transcript)}</div>
  <div class="section"><h2>English Translation</h2>${paragraphHtml(meeting?.englishTranslation)}</div>
  </body></html>`;
};

const emptyForm = (start = new Date()) => {
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return {
    id: "",
    hostName: global1.name || "",
    hostEmail: currentEmail(),
    topic: "",
    description: "",
    meetingLink: "",
    startDateTime: localDateTime(start),
    endDateTime: localDateTime(end),
    participants: []
  };
};

const calendarRange = (view, anchorDate) => {
  if (view === "day") return { start: anchorDate, end: endOfDay(anchorDate) };
  if (view === "week") {
    const start = startOfWeek(anchorDate);
    return { start, end: endOfDay(addDays(start, 6)) };
  }
  const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const end = endOfDay(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0));
  return { start, end };
};

function MeetingCard({ meeting, onClick }) {
  return (
    <Box
      onClick={() => onClick(meeting)}
      sx={{
        p: 0.75,
        my: 0.4,
        borderRadius: 1,
        bgcolor: "#e8f1ff",
        border: "1px solid #b9d4ff",
        cursor: "pointer"
      }}
    >
      <Typography variant="caption" fontWeight={800} sx={{ display: "block", color: "#174ea6" }}>
        {new Date(meeting.startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {meeting.topic}
      </Typography>
      <Typography variant="caption" sx={{ display: "block", color: "#111827" }}>{meeting.hostName}</Typography>
    </Box>
  );
}

export default function TranscriptMeetingsCalendarPage({ myOnly = false }) {
  const navigate = useNavigate();
  const [view, setView] = useState("week");
  const [anchor, setAnchor] = useState(localDate(new Date()));
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const anchorDate = useMemo(() => parseDate(anchor), [anchor]);
  const range = useMemo(() => calendarRange(view, anchorDate), [view, anchorDate]);

  useEffect(() => {
    loadUsers();
    loadInstitution();
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [view, anchor, myOnly]);

  const loadUsers = async (q = "") => {
    try {
      const res = await ep1.get("/api/v2/transcript-meeting-users", { params: { colid: global1.colid, q } });
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load users");
    }
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/transcript-meetings", {
        params: {
          colid: global1.colid,
          start: range.start.toISOString(),
          end: range.end.toISOString(),
          my: myOnly ? "Yes" : "No",
          email: currentEmail()
        }
      });
      setMeetings(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (date) => {
    setSelectedMeeting(null);
    setForm(emptyForm(date));
    setDialogOpen(true);
  };

  const openEdit = (meeting) => {
    setSelectedMeeting(meeting);
    setForm({
      id: meeting._id,
      hostName: meeting.hostName || "",
      hostEmail: meeting.hostEmail || "",
      topic: meeting.topic || "",
      description: meeting.description || "",
      meetingLink: meeting.meetingLink || "",
      startDateTime: localDateTime(parseDate(meeting.startDateTime)),
      endDateTime: localDateTime(parseDate(meeting.endDateTime)),
      participants: meeting.participants || []
    });
    setDialogOpen(true);
  };

  const saveMeeting = async () => {
    try {
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/transcript-meetings", {
        ...form,
        colid: global1.colid,
        createdBy: global1.user || currentEmail()
      });
      setDialogOpen(false);
      setMessage(res.data?.topic ? "Meeting saved" : "Meeting saved successfully");
      loadMeetings();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save meeting");
    }
  };

  const deleteMeeting = async () => {
    if (!form.id || !window.confirm("Delete this meeting?")) return;
    try {
      await ep1.post("/api/v2/transcript-meetings-delete", { id: form.id, colid: global1.colid });
      setDialogOpen(false);
      setMessage("Meeting deleted");
      loadMeetings();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete meeting");
    }
  };

  const openGoogleCalendar = () => {
    window.open(buildGoogleCalendarUrl(form), "_blank", "noopener,noreferrer");
  };

  const printMinutes = () => {
    if (!selectedMeeting) return;
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) return;
    popup.document.write(buildMinutesHtml(selectedMeeting, institution));
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const dayMeetings = (date) => meetings.filter((item) => sameDay(item.startDateTime, date));
  const hourMeetings = (date, hour) => dayMeetings(date).filter((item) => new Date(item.startDateTime).getHours() === hour);
  const hours = Array.from({ length: 14 }, (_, index) => index + 7);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(anchorDate), index));
  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const monthGridStart = startOfWeek(monthStart);
  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(monthGridStart, index));

  const shift = (amount) => {
    if (view === "day") setAnchor(localDate(addDays(anchorDate, amount)));
    if (view === "week") setAnchor(localDate(addDays(anchorDate, amount * 7)));
    if (view === "month") setAnchor(localDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + amount, 1)));
  };

  const renderDaily = () => (
    <Grid container spacing={1}>
      {hours.map((hour) => {
        const slot = new Date(anchorDate);
        slot.setHours(hour, 0, 0, 0);
        return (
          <Grid item xs={12} key={hour}>
            <Box onDoubleClick={() => openCreate(slot)} sx={{ display: "grid", gridTemplateColumns: "90px 1fr", minHeight: 72, border: "1px solid #d7dee8", borderRadius: 1, bgcolor: "#fff" }}>
              <Box sx={{ p: 1, bgcolor: "#f4f7fb", borderRight: "1px solid #d7dee8", fontWeight: 800 }}>{pad(hour)}:00</Box>
              <Box sx={{ p: 1 }}>
                {hourMeetings(anchorDate, hour).map((meeting) => <MeetingCard key={meeting._id} meeting={meeting} onClick={openEdit} />)}
              </Box>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );

  const renderWeekly = () => (
    <Box sx={{ overflowX: "auto" }}>
      <Box sx={{ minWidth: 960, display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)", border: "1px solid #d7dee8", bgcolor: "#fff" }}>
        <Box sx={{ p: 1, bgcolor: "#f4f7fb", fontWeight: 800 }}>Time</Box>
        {weekDays.map((day) => <Box key={localDate(day)} sx={{ p: 1, bgcolor: "#f4f7fb", borderLeft: "1px solid #d7dee8", fontWeight: 800 }}>{day.toLocaleDateString([], { weekday: "short", day: "2-digit" })}</Box>)}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <Box sx={{ p: 1, borderTop: "1px solid #d7dee8", bgcolor: "#fafbfc", fontWeight: 700 }}>{pad(hour)}:00</Box>
            {weekDays.map((day) => {
              const slot = new Date(day);
              slot.setHours(hour, 0, 0, 0);
              return (
                <Box key={`${localDate(day)}-${hour}`} onDoubleClick={() => openCreate(slot)} sx={{ p: 0.75, minHeight: 84, borderTop: "1px solid #d7dee8", borderLeft: "1px solid #d7dee8" }}>
                  {hourMeetings(day, hour).map((meeting) => <MeetingCard key={meeting._id} meeting={meeting} onClick={openEdit} />)}
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );

  const renderMonthly = () => (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", border: "1px solid #d7dee8", bgcolor: "#fff" }}>
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <Box key={day} sx={{ p: 1, bgcolor: "#f4f7fb", borderLeft: "1px solid #d7dee8", fontWeight: 800 }}>{day}</Box>)}
      {monthDays.map((day) => (
        <Box key={localDate(day)} onDoubleClick={() => {
          const slot = new Date(day);
          slot.setHours(9, 0, 0, 0);
          openCreate(slot);
        }} sx={{ minHeight: 128, p: 1, borderTop: "1px solid #d7dee8", borderLeft: "1px solid #d7dee8", bgcolor: day.getMonth() === anchorDate.getMonth() ? "#fff" : "#f8fafc" }}>
          <Typography variant="caption" fontWeight={800}>{day.getDate()}</Typography>
          {dayMeetings(day).slice(0, 4).map((meeting) => <MeetingCard key={meeting._id} meeting={meeting} onClick={openEdit} />)}
          {dayMeetings(day).length > 4 && <Chip size="small" label={`+${dayMeetings(day).length - 4} more`} />}
        </Box>
      ))}
    </Box>
  );

  return (
    <PlacementCoordinatorShell title={myOnly ? "My meetings" : "Meetings calendar"}>
      <Paper sx={{ p: 2.5, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>{myOnly ? "My meetings" : "Meetings calendar"}</Typography>
            <Typography variant="body2" color="text.secondary">Double click a calendar cell to create a meeting.</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" onClick={() => shift(-1)}>Previous</Button>
            <Button variant="outlined" onClick={() => setAnchor(localDate(new Date()))}>Today</Button>
            <Button variant="outlined" onClick={() => shift(1)}>Next</Button>
            <Tooltip title="Refresh meetings">
              <IconButton onClick={loadMeetings}><RefreshIcon /></IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreate(new Date())}>New Meeting</Button>
          </Stack>
        </Stack>

        {message && <Alert severity="success" sx={{ my: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ my: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ my: 2 }} alignItems={{ xs: "stretch", md: "center" }}>
          <ToggleButtonGroup exclusive value={view} onChange={(event, value) => value && setView(value)} size="small">
            <ToggleButton value="day">Daily</ToggleButton>
            <ToggleButton value="week">Weekly</ToggleButton>
            <ToggleButton value="month">Monthly</ToggleButton>
          </ToggleButtonGroup>
          <TextField type="date" size="small" label="Calendar date" InputLabelProps={{ shrink: true }} value={anchor} onChange={(event) => setAnchor(event.target.value)} />
          <Chip icon={<EventIcon />} label={`${meetings.length} meeting${meetings.length === 1 ? "" : "s"}`} color={myOnly ? "secondary" : "primary"} />
          {loading && <Chip label="Loading..." />}
        </Stack>

        {view === "day" && renderDaily()}
        {view === "week" && renderWeekly()}
        {view === "month" && renderMonthly()}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{form.id ? "Edit meeting" : "Create meeting"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Host name" value={form.hostName} onChange={(e) => setForm({ ...form, hostName: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Host email" value={form.hostEmail} onChange={(e) => setForm({ ...form, hostEmail: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="datetime-local" label="Start date time" InputLabelProps={{ shrink: true }} value={form.startDateTime} onChange={(e) => setForm({ ...form, startDateTime: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="datetime-local" label="End date time" InputLabelProps={{ shrink: true }} value={form.endDateTime} onChange={(e) => setForm({ ...form, endDateTime: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={users}
                value={form.participants}
                onInputChange={(event, value) => loadUsers(value)}
                onChange={(event, value) => setForm({ ...form, participants: value })}
                getOptionLabel={(option) => `${option.name || ""}${option.email ? ` (${option.email})` : ""}`}
                isOptionEqualToValue={(option, value) => option.email === value.email}
                renderInput={(params) => <TextField {...params} label="Participants" placeholder="Search name, email, phone or department" />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Meeting link" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" startIcon={<GoogleIcon />} onClick={openGoogleCalendar}>
                Login/Open Google Calendar
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                Create the Google Calendar event, generate the Meet link there, then paste the link above.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={4} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
            {selectedMeeting && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc" }}>
                  <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Meeting details and minutes</Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2"><b>Host:</b> {selectedMeeting.hostName} ({selectedMeeting.hostEmail})</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2"><b>Date:</b> {parseDate(selectedMeeting.startDateTime).toLocaleString()} - {parseDate(selectedMeeting.endDateTime).toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2"><b>Participants:</b> {(selectedMeeting.participants || []).map((p) => `${p.name || ""}${p.email ? ` (${p.email})` : ""}`).join(", ")}</Typography>
                    </Grid>
                    {selectedMeeting.audioUrl && (
                      <Grid item xs={12}>
                        <Typography variant="body2"><b>Audio:</b> <Link href={selectedMeeting.audioUrl} target="_blank" rel="noopener noreferrer">{selectedMeeting.audioUrl}</Link></Typography>
                      </Grid>
                    )}
                    {selectedMeeting.summary && (
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth multiline minRows={4} label="Summary" value={selectedMeeting.summary || ""} InputProps={{ readOnly: true }} />
                      </Grid>
                    )}
                    {selectedMeeting.actionItems && (
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth multiline minRows={4} label="Action Items" value={selectedMeeting.actionItems || ""} InputProps={{ readOnly: true }} />
                      </Grid>
                    )}
                    {selectedMeeting.transcript && (
                      <Grid item xs={12}>
                        <TextField fullWidth multiline minRows={5} label="Transcript" value={selectedMeeting.transcript || ""} InputProps={{ readOnly: true }} />
                      </Grid>
                    )}
                    {selectedMeeting.englishTranslation && (
                      <Grid item xs={12}>
                        <TextField fullWidth multiline minRows={5} label="English Translation" value={selectedMeeting.englishTranslation || ""} InputProps={{ readOnly: true }} />
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          {form.id && <Button color="error" startIcon={<DeleteIcon />} onClick={deleteMeeting}>Delete</Button>}
          {form.id && <Button startIcon={<MicIcon />} onClick={() => navigate(`/meeting-transcript-recorder?meetingid=${form.id}`)}>Record Audio</Button>}
          {selectedMeeting && <Button startIcon={<PrintIcon />} onClick={printMinutes} disabled={!selectedMeeting.transcript && !selectedMeeting.summary}>Print Minutes</Button>}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveMeeting}>Save</Button>
        </DialogActions>
      </Dialog>
    </PlacementCoordinatorShell>
  );
}
