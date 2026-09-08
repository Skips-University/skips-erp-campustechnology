import React, { useState, useEffect } from "react";
import ep1 from "../api/ep1";
import global1 from "./global1";
//import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
    if (!(d1 instanceof Date)) d1 = new Date(d1);
    if (!(d2 instanceof Date)) d2 = new Date(d2);

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const fetchAllAttendance = async (email) => {
    try {
      const res = await ep1.get(
        `/api/v2/getattendancebyemailj?email=${email.trim()}`
      );
      setAttendanceList(res.data.attendance || []);
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

  // useEffect(() => {
  //   const init = async () => {
  //     setLoading(true);

  //     if (!email) {
  //       setError("No email found in global state");
  //       setLoading(false);
  //       return;
  //     }
  //     try {
  //       let res = await axios.get("https://api64.ipify.org?format=json");
  //       if (!res.data.ip) {
  //         res = await axios.get("https://api.ipify.org?format=json");
  //       }
  //       const ipAddr = res.data.ip;
  //       setIp(ipAddr);

  //       await fetchAllAttendance(email); // ✅ pass email
  //       await fetchStatus(email, ipAddr);
  //     } catch (err) {
  //       console.error(err);
  //       setError("Failed to initialize attendance data");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   init();
  // }, [email]);
  
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      if (!email) {
        setError("No email found in global state");
        setLoading(false);
        return;
      }

      try {
        // ✅ Fetch IP from backend instead of ipify.org
        const res = await ep1.get("/api/v2/getipj");
        const ipAddr = res.data.ip;
        console.log("Fetched IP:", ipAddr);
        setIp(ipAddr);

        // Fetch attendance + status from backend
        await fetchAllAttendance(email);
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
      const res = await ep1.post("/api/v2/checkinj", { ip, email });
      setMessage(res.data.message || "Checked in successfully");
      setStatus("checked_in");
      setError("");
      await fetchAllAttendance(email); // ✅ pass email
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
      const res = await ep1.post("/api/v2/checkoutj", { email, ip });
      setMessage(res.data.message || "Checked out successfully");
      setStatus("checked_out");
      setError("");
      await fetchAllAttendance(email); // ✅ pass email
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
                  const date = props.day.toDate(); // ✅ FIXED
                  const found = attendanceList.find((r) =>
                    sameDay(new Date(r.date), date)
                  );
                  let status = null;
                  if (found) {
                    status =
                      found.status === "Half Day" ? "half-day" : "full-day";
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
