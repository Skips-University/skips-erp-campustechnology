import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { AutoMode, Refresh } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";
import NepLmsFacultyClassSelector, { classLabel } from "./NepLmsFacultyClassSelector";

export default function NepLmsOtpAttendancePage() {
  const initialClassId = new URLSearchParams(window.location.search).get("classid") || "";
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceType, setAttendanceType] = useState("Regular");
  const [otps, setOtps] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validTill, setValidTill] = useState("");

  const displayOtp = useMemo(() => (activeIndex >= 0 && activeIndex < otps.length ? otps[activeIndex] : ""), [activeIndex, otps]);

  useEffect(() => {
    if (!otps.length || activeIndex < 0 || activeIndex >= otps.length) return undefined;
    setSecondsLeft(6);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        setActiveIndex((current) => (current + 1 < otps.length ? current + 1 : otps.length));
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeIndex, otps]);

  const createOtps = async () => {
    if (!selectedClass) {
      setError("Please select a class.");
      return;
    }
    setGenerating(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/neplms/attendance/otp/create", {
        colid: global1.colid,
        user: global1.user,
        type: attendanceType,
        classInfo: selectedClass
      });
      setOtps(res.data?.otps || []);
      setValidTill(res.data?.validtill || "");
      setActiveIndex(0);
      setMessage(`Six OTPs generated. Display will rotate every 6 seconds.${res.data?.validtill ? ` Valid till ${new Date(res.data.validtill).toLocaleString()}.` : ""}`);
    } catch (err) {
      setOtps([]);
      setActiveIndex(-1);
      setValidTill("");
      setError(err.response?.data?.message || "Unable to generate OTPs.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <MenuPageShell title="OTP Attendance">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

          <NepLmsFacultyClassSelector
            title="Select Class for OTP Attendance"
            selectedClassId={selectedClass?._id || ""}
            onSelectClass={setSelectedClass}
            initialClassId={initialClassId}
          />

          <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="Attendance Type"
                  value={attendanceType}
                  onChange={(event) => setAttendanceType(event.target.value)}
                  sx={{ minWidth: 220 }}
                >
                  <option value="Regular">Regular</option>
                  <option value="Supplementary">Supplementary</option>
                </TextField>
                <Button variant="contained" startIcon={<AutoMode />} disabled={generating || !selectedClass} onClick={createOtps}>
                  {generating ? "Generating..." : "Create six random OTP"}
                </Button>
                <Button variant="outlined" startIcon={<Refresh />} disabled={!otps.length} onClick={() => setActiveIndex(0)}>
                  Replay Display
                </Button>
              </Stack>
              {generating && <LinearProgress />}
              {selectedClass && <Alert severity="info">Class: {classLabel(selectedClass)}{validTill ? ` | OTP valid till ${new Date(validTill).toLocaleString()}` : ""}</Alert>}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, textAlign: "center" }}>
            {displayOtp ? (
              <Stack spacing={2} alignItems="center">
                <Chip color="primary" label={`OTP ${activeIndex + 1} of 6`} />
                <Typography sx={{ fontSize: { xs: 54, md: 88 }, fontWeight: 900, letterSpacing: 8, color: "#102a43" }}>
                  {displayOtp}
                </Typography>
                <Typography variant="h6" color="text.secondary">{secondsLeft} seconds remaining</Typography>
                <LinearProgress variant="determinate" value={(secondsLeft / 6) * 100} sx={{ width: "100%", maxWidth: 520 }} />
              </Stack>
            ) : otps.length ? (
              <Alert severity="success">All six OTPs have been displayed.</Alert>
            ) : (
              <Typography color="text.secondary">Generate OTPs after selecting a class.</Typography>
            )}
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
