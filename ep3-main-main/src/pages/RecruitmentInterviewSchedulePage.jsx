import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventIcon from "@mui/icons-material/Event";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankSchedule = {
  id: "",
  jobid: "",
  jobtitle: "",
  panelid: "",
  panelname: "",
  interviewdate: "",
  interviewtime: "",
  mode: "Offline",
  venue: "",
  meetinglink: "",
  status: "Scheduled",
  remarks: ""
};

export default function RecruitmentInterviewSchedulePage() {
  const [jobs, setJobs] = useState([]);
  const [panelJobs, setPanelJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [panelMembers, setPanelMembers] = useState([]);
  const [panelClasses, setPanelClasses] = useState([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [form, setForm] = useState(blankSchedule);
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const colid = global1.colid;

  const jobOptions = useMemo(() => jobs.map((job) => ({ ...job, label: `${job.jobid} - ${job.title}` })), [jobs]);
  const panelOptions = useMemo(() => panelJobs.map((item) => ({ ...item, label: `${item.panelid} - ${item.panelname}` })), [panelJobs]);
  const selectedCandidates = useMemo(() => applications.filter((item) => selectedCandidateIds.includes(item._id)), [applications, selectedCandidateIds]);
  const classTimeSlots = useMemo(() => {
    const values = panelClasses.map((item) => item.classtime || "No time");
    return Array.from(new Set(values)).sort((a, b) => {
      if (a === "No time") return 1;
      if (b === "No time") return -1;
      return String(a).localeCompare(String(b));
    });
  }, [panelClasses]);

  const loadJobs = async () => {
    const res = await ep1.get("/api/v2/recruitment/jobs", { params: { colid } });
    setJobs(res.data || []);
  };

  const loadForJob = async (jobid = form.jobid) => {
    if (!jobid) return;
    setLoading(true);
    setError("");
    try {
      const [panelRes, appRes, scheduleRes] = await Promise.all([
        ep1.get("/api/v2/recruitment/interview-panel-jobs", { params: { colid, jobid } }),
        ep1.get("/api/v2/recruitment/applications", { params: { colid, jobid } }),
        ep1.get("/api/v2/recruitment/interview-schedules", { params: { colid, jobid } })
      ]);
      setPanelJobs(panelRes.data || []);
      setApplications(appRes.data || []);
      setSchedules(scheduleRes.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load interview data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);
  useEffect(() => { if (form.jobid) loadForJob(form.jobid); }, [form.jobid]);

  const loadPanelCalendar = async () => {
    if (!form.panelid || !form.interviewdate) {
      setPanelMembers([]);
      setPanelClasses([]);
      return;
    }
    setCalendarLoading(true);
    try {
      const res = await ep1.get("/api/v2/recruitment/panel-class-calendar", {
        params: { colid, panelid: form.panelid, classdate: form.interviewdate }
      });
      setPanelMembers(res.data?.members || []);
      setPanelClasses(res.data?.classes || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load panel class calendar");
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => { loadPanelCalendar(); }, [form.panelid, form.interviewdate]);

  const scheduleInterview = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const candidates = form.id
        ? [{ applicationid: form.applicationid, applicationno: form.applicationno, candidate: form.candidate, candidateemail: form.candidateemail, candidatephone: form.candidatephone }]
        : selectedCandidates.map((candidate) => ({
          applicationid: candidate._id,
          applicationno: candidate.applicationno,
          candidate: candidate.applicantname,
          candidateemail: candidate.email,
          candidatephone: candidate.phone
        }));
      if (!form.id && !candidates.length) throw new Error("Select at least one candidate");
      const res = await ep1.post("/api/v2/recruitment/interview-schedules", { ...form, colid, user: global1.user, candidates });
      setMessage(`${res.data?.saved?.length || 0} interview schedule record(s) saved`);
      setSelectedCandidateIds([]);
      setForm({ ...blankSchedule, jobid: form.jobid, jobtitle: form.jobtitle, panelid: form.panelid, panelname: form.panelname });
      loadForJob(form.jobid);
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Unable to schedule interview");
    } finally {
      setSaving(false);
    }
  };

  const deleteSchedule = async (row) => {
    if (!window.confirm(`Delete interview schedule for ${row.candidate}?`)) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/recruitment/interview-schedules-delete", { colid, id: row._id });
      setMessage("Interview schedule deleted");
      loadForJob(form.jobid || row.jobid);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete schedule");
    } finally {
      setSaving(false);
    }
  };

  const candidateColumns = [
    { field: "applicationno", headerName: "Application No", minWidth: 180, flex: 0.9 },
    { field: "applicantname", headerName: "Candidate", minWidth: 200, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 220, flex: 1.1 },
    { field: "phone", headerName: "Phone", minWidth: 140, flex: 0.7 },
    { field: "status", headerName: "Status", minWidth: 140, flex: 0.7 },
    { field: "approvalstatus", headerName: "Approval", minWidth: 140, flex: 0.7 }
  ];

  const scheduleColumns = [
    { field: "candidate", headerName: "Candidate", minWidth: 190, flex: 1 },
    { field: "candidateemail", headerName: "Email", minWidth: 220, flex: 1.1 },
    { field: "panelname", headerName: "Panel", minWidth: 180, flex: 0.9 },
    { field: "jobtitle", headerName: "Job", minWidth: 200, flex: 1 },
    { field: "interviewdate", headerName: "Date", minWidth: 130, flex: 0.6, valueGetter: ({ row }) => row.interviewdate ? String(row.interviewdate).slice(0, 10) : "" },
    { field: "interviewtime", headerName: "Time", minWidth: 110, flex: 0.5 },
    { field: "mode", headerName: "Mode", minWidth: 110, flex: 0.5 },
    { field: "venue", headerName: "Venue/Link", minWidth: 220, flex: 1, valueGetter: ({ row }) => row.mode === "Online" ? row.meetinglink : row.venue },
    { field: "status", headerName: "Status", minWidth: 130, flex: 0.6 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm({ ...blankSchedule, ...row, id: row._id, interviewdate: row.interviewdate ? String(row.interviewdate).slice(0, 10) : "" })} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteSchedule(row)} showInMenu />
      ]
    }
  ];

  const classesForMemberAtTime = (member, slot) => {
    const email = String(member.memberemail || "").trim().toLowerCase();
    return panelClasses.filter((item) => String(item.facultyemail || "").trim().toLowerCase() === email && (item.classtime || "No time") === slot);
  };

  const renderPanelCalendar = () => (
    <Paper sx={{ p: 2, mb: 2, border: "1px solid #d7e3f4", bgcolor: "#fbfdff" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography fontWeight={800}>Panel Class Calendar</Typography>
          <Typography variant="body2" color="text.secondary">
            Classes scheduled for panel members on {form.interviewdate || "selected date"}.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" color="primary" label={`${panelMembers.length} member(s)`} />
          <Chip size="small" color={panelClasses.length ? "warning" : "success"} label={`${panelClasses.length} class(es)`} />
          <Button size="small" variant="outlined" onClick={loadPanelCalendar} disabled={calendarLoading || !form.panelid || !form.interviewdate}>Refresh Calendar</Button>
        </Stack>
      </Stack>
      {calendarLoading && <LinearProgress sx={{ mb: 2 }} />}
      {!form.panelid || !form.interviewdate ? (
        <Alert severity="info">Select an interview panel and interview date to view panel members' class calendar.</Alert>
      ) : !panelMembers.length ? (
        <Alert severity="warning">No members are added to this panel.</Alert>
      ) : !panelClasses.length ? (
        <Alert severity="success">No classes are scheduled for the selected panel members on this date.</Alert>
      ) : (
        <Box sx={{ overflowX: "auto", border: "1px solid #dbe4f0", borderRadius: 1, bgcolor: "#fff" }}>
          <Box
            sx={{
              minWidth: Math.max(760, 180 + panelMembers.length * 240),
              display: "grid",
              gridTemplateColumns: `150px repeat(${panelMembers.length}, minmax(220px, 1fr))`
            }}
          >
            <Box sx={{ p: 1.2, fontWeight: 800, bgcolor: "#eef4ff", borderRight: "1px solid #dbe4f0", borderBottom: "1px solid #dbe4f0" }}>Time</Box>
            {panelMembers.map((member) => (
              <Box key={member._id} sx={{ p: 1.2, bgcolor: "#eef4ff", borderRight: "1px solid #dbe4f0", borderBottom: "1px solid #dbe4f0" }}>
                <Typography fontWeight={800} sx={{ fontSize: 13 }}>{member.membername}</Typography>
                <Typography variant="caption" color="text.secondary">{member.memberemail}</Typography>
              </Box>
            ))}
            {classTimeSlots.map((slot) => (
              <React.Fragment key={slot}>
                <Box sx={{ p: 1.2, fontWeight: 700, bgcolor: "#f8fafc", borderRight: "1px solid #e5edf7", borderBottom: "1px solid #e5edf7" }}>{slot}</Box>
                {panelMembers.map((member) => {
                  const rows = classesForMemberAtTime(member, slot);
                  return (
                    <Box key={`${slot}-${member._id}`} sx={{ minHeight: 96, p: 1, borderRight: "1px solid #e5edf7", borderBottom: "1px solid #e5edf7", bgcolor: rows.length ? "#fff8ed" : "#ffffff" }}>
                      {rows.map((item) => (
                        <Box key={item._id} sx={{ p: 1, mb: 1, borderRadius: 1, bgcolor: "#fff", border: "1px solid #f5c26b", boxShadow: "0 1px 4px rgba(15,23,42,0.08)" }}>
                          <Typography fontWeight={800} sx={{ fontSize: 13 }}>{item.coursecode} {item.course}</Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {item.programcode || item.program || "-"} | Sem {item.semester || "-"} | Period {item.period || "-"}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Duration: {item.durationminutes || 0} min
                          </Typography>
                          {(item.module || item.topic) && (
                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                              {item.module}{item.module && item.topic ? " - " : ""}{item.topic}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  );
                })}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );

  return (
    <MenuPageShell title="Schedule Interviews">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Interview Scheduling</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Select candidates, select the job interview panel, and schedule interview dates.</Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {saving && <LinearProgress sx={{ mb: 2 }} />}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={jobOptions}
                value={jobOptions.find((job) => job.jobid === form.jobid) || null}
                getOptionLabel={(option) => option.label || ""}
                onChange={(_, value) => setForm({ ...blankSchedule, jobid: value?.jobid || "", jobtitle: value?.title || "" })}
                renderInput={(params) => <TextField {...params} label="Search/select job posting" />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={panelOptions}
                value={panelOptions.find((panel) => panel.panelid === form.panelid) || null}
                getOptionLabel={(option) => option.label || ""}
                onChange={(_, value) => setForm({ ...form, panelid: value?.panelid || "", panelname: value?.panelname || "" })}
                renderInput={(params) => <TextField {...params} label="Interview panel for selected job" />}
              />
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Interview Date" InputLabelProps={{ shrink: true }} value={form.interviewdate} onChange={(e) => setForm({ ...form, interviewdate: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="time" label="Time" InputLabelProps={{ shrink: true }} value={form.interviewtime} onChange={(e) => setForm({ ...form, interviewtime: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Mode" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                {["Offline", "Online", "Hybrid"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Meeting Link" value={form.meetinglink} onChange={(e) => setForm({ ...form, meetinglink: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {["Scheduled", "Completed", "Cancelled", "Rescheduled"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" startIcon={<EventIcon />} onClick={scheduleInterview} disabled={saving || !form.jobid || !form.panelid}>{form.id ? "Update" : "Schedule"}</Button>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Grid>
          </Grid>
        </Paper>

        {renderPanelCalendar()}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                <Typography fontWeight={700}>Candidates</Typography>
                <Typography variant="body2" color="text.secondary">{selectedCandidateIds.length} selected</Typography>
              </Stack>
              <Box sx={{ height: 420 }}>
                <DataGrid
                  rows={applications}
                  columns={candidateColumns}
                  getRowId={(row) => row._id}
                  loading={loading}
                  checkboxSelection
                  rowSelectionModel={selectedCandidateIds}
                  onRowSelectionModelChange={(ids) => setSelectedCandidateIds(ids)}
                  pageSizeOptions={[10, 25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                  slots={{ toolbar: GridToolbar }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>Scheduled Interviews</Typography>
              <Box sx={{ height: 420 }}>
                <DataGrid rows={schedules} columns={scheduleColumns} getRowId={(row) => row._id} loading={loading} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} slots={{ toolbar: GridToolbar }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MenuPageShell>
  );
}
