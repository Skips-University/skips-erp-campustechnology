import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Refresh, Save } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MentoringLayout from "./MentoringLayout";

const label = (row = {}) => {
  const validTill = row.validtill ? ` | Valid till ${new Date(row.validtill).toLocaleTimeString()}` : "";
  return `${row.classdate || ""} ${row.classtime || ""} | ${row.coursecode || ""} - ${row.course || ""} | Sem ${row.semester || ""}${validTill}`;
};

export default function NepLmsStudentOtpAttendancePage() {
  const [sessions, setSessions] = useState([]);
  const [student, setStudent] = useState({});
  const [sessionid, setSessionid] = useState("");
  const [otps, setOtps] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedSession = useMemo(() => sessions.find((row) => row._id === sessionid) || null, [sessions, sessionid]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/neplms/attendance/otp/student-sessions", {
        params: {
          colid: global1.colid,
          regno: global1.regno,
          email: global1.user
        }
      });
      const data = res.data?.data || [];
      setSessions(data);
      setStudent(res.data?.student || {});
      if (!sessionid && data.length) setSessionid(data[0]._id);
    } catch (err) {
      setSessions([]);
      setError(err.response?.data?.message || "Unable to load OTP sessions.");
    } finally {
      setLoading(false);
    }
  };

  const updateOtp = (index, value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 6);
    setOtps((prev) => prev.map((item, idx) => (idx === index ? digits : item)));
  };

  const submitOtps = async () => {
    if (!sessionid) {
      setError("Please select a class.");
      return;
    }
    if (otps.some((otp) => otp.length !== 6)) {
      setError("Please enter all six 6 digit OTPs.");
      return;
    }
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/neplms/attendance/otp/submit", {
        colid: global1.colid,
        regno: global1.regno,
        email: global1.user,
        user: global1.user,
        sessionid,
        otps
      });
      setMessage(res.data?.message || "Attendance marked present.");
      setOtps(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit OTP attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MentoringLayout title="OTP Attendance" student>
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Enter Class OTPs</Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.name || global1.name || "Student"} | {student.regno || global1.regno || "-"} | {student.programcode || "-"} | Sem {student.semester || "-"}
                </Typography>
              </Box>
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadSessions} disabled={loading}>Refresh</Button>
            </Stack>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            <TextField select fullWidth label="Active OTP Class" value={sessionid} onChange={(event) => setSessionid(event.target.value)}>
              {sessions.map((row) => <MenuItem key={row._id} value={row._id}>{label(row)}</MenuItem>)}
            </TextField>
            {selectedSession && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Selected: {label(selectedSession)}
              </Alert>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {otps.map((otp, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <TextField
                    fullWidth
                    label={`OTP ${index + 1}`}
                    value={otp}
                    onChange={(event) => updateOtp(index, event.target.value)}
                    inputProps={{ inputMode: "numeric", maxLength: 6, style: { letterSpacing: 4, fontWeight: 800 } }}
                  />
                </Grid>
              ))}
            </Grid>
            <Button sx={{ mt: 2 }} variant="contained" startIcon={<Save />} disabled={submitting || !sessionid} onClick={submitOtps}>
              {submitting ? "Submitting..." : "Submit OTP Attendance"}
            </Button>
            {submitting && <LinearProgress sx={{ mt: 2 }} />}
          </Paper>
        </Stack>
      </Box>
    </MentoringLayout>
  );
}
