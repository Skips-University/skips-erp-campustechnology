import React, { useState, useEffect } from "react";
import ep1 from "../api/ep1";
import axios from "axios";
import global1 from "./global1";
// import {
//   LocalizationProvider,
// } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
import { styled } from "@mui/material/styles";
import { Box, Button, Typography, Alert } from "@mui/material";

// Custom day rendering with attendance highlights
const CustomDay = styled(PickersDay)(({ status }) => ({
  ...(status === "full-day" && {
    backgroundColor: "#28a745",
    color: "#fff",
    borderRadius: "50%",
    "&:hover, &:focus": {
      backgroundColor: "#218838",
    },
  }),
  ...(status === "half-day" && {
    backgroundColor: "#ffc107",
    color: "#fff",
    borderRadius: "50%",
    "&:hover, &:focus": {
      backgroundColor: "#e0a800",
    },
  }),
}));

const AttendancePage = () => {
  const [ip, setIp] = useState("");
  const email = global1.user || "";
  const [attendanceList, setAttendanceList] = useState([]);
  const [status, setStatus] = useState("no-checkin");
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sameDay = (d1, d2) => {
    const a = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const b = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return a.getTime() === b.getTime();
  };

  const fetchAllAttendance = async () => {
    try {
      const res = await ep1.get("/api/v2/getallattendancesj");
      setAttendanceList(res.data.reports || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load attendance data");
    }
  };

  const fetchStatus = async (userEmail, userIp) => {
    try {
      const resStatus = await ep1.get("/api/v2/getattendancestatusj", {
        params: { email: userEmail, ip: userIp },
      });
      const cleanStatus = (resStatus.data.status || "no_checkin")
        .trim()
        .toLowerCase();
      setStatus(cleanStatus);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch status");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      if (!email) {
        setError("No email found in global state");
        setLoading(false);
        return;
      }
      try {
        let res = await axios.get("https://api64.ipify.org?format=json");
        if (!res.data.ip) {
          res = await axios.get("https://api.ipify.org?format=json");
        }
        const ipAddr = res.data.ip;
        setIp(ipAddr);

        await fetchAllAttendance();
        await fetchStatus(email, ipAddr);
      } catch (err) {
        console.error(err);
        setError("Failed to initialize attendance data");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [email]);

  const handleCheckIn = async () => {
    const indianTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const confirmed = window.confirm(
      `You are checking in at ${indianTime}. Continue?`
    );
    if (!confirmed) return;

    setLoadingAction(true);
    try {
      const res = await ep1.post("/checkinj", { ip, email });
      setMessage(res.data.message || "Checked in successfully");
      setStatus("checked_in");
      setError("");
      await fetchAllAttendance();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Check-in failed");
      setMessage("");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCheckOut = async () => {
    const indianTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const confirmed = window.confirm(
      `You are checking out at ${indianTime}. Continue?`
    );
    if (!confirmed) return;

    setLoadingAction(true);
    try {
      const res = await ep1.post("/checkoutj", { email, ip });
      setMessage(res.data.message || "Checked out successfully");
      setStatus("checked_out");
      setError("");
      await fetchAllAttendance();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Check-out failed");
      setMessage("");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 700,
        margin: "40px auto",
        p: 4,
        fontFamily: "Segoe UI, sans-serif",
        bgcolor: "#f4f6f8",
        borderRadius: 2,
        boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{ color: "#333", mb: 3, fontWeight: 600 }}
      >
        📅 Attendance Tracker
      </Typography>

      {loading ? (
        <Typography align="center" sx={{ fontSize: 14, color: "#777" }}>
          Loading...
        </Typography>
      ) : (
        <>
          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              ⚠️ {error}
            </Alert>
          )}

          <Box sx={{ textAlign: "center", mb: 2 }}>
            {(status === "checked_out" || status === "no_checkin") && (
              <Button
                onClick={handleCheckIn}
                disabled={loadingAction}
                variant="contained"
                color="success"
              >
                {loadingAction ? "Please wait..." : "✅ Check In"}
              </Button>
            )}
            {status === "checked_in" && (
              <Button
                onClick={handleCheckOut}
                disabled={loadingAction}
                variant="contained"
                color="error"
              >
                {loadingAction ? "Please wait..." : "⏱ Check Out"}
              </Button>
            )}
          </Box>

          {/* Calendar with attendance highlights */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              slots={{
                day: (props) => {
                  const date = props.day;
                  const found = attendanceList.find((r) =>
                    sameDay(new Date(r.date), date)
                  );
                  let status = null;
                  if (found) {
                    status = found.status === "Half Day" ? "half-day" : "full-day";
                  }
                  return <CustomDay {...props} status={status} />;
                },
              }}
            />
          </LocalizationProvider>
        </>
      )}
    </Box>
  );
};

export default AttendancePage;
