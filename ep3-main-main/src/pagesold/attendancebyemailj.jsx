import React, { useState } from "react";
import ep1 from "../api/ep1";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

// Custom styled day component for attendance highlighting
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

export default function AttendanceSearch() {
  const [email, setEmail] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

 const sameDay = (d1, d2) => {
    if (!(d1 instanceof Date)) d1 = new Date(d1);
    if (!(d2 instanceof Date)) d2 = new Date(d2);

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const handleSearch = async () => {
    if (!email.trim()) {
      setMsg("Please enter an email");
      setReports([]);
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const { data } = await ep1.get(
        `/api/v2/getattendancebyemailj?email=${email.trim()}`
      );
      if (data.attendance && data.attendance.length > 0) {
        setReports(data.attendance);
        setMsg("");
      } else {
        setReports([]);
        setMsg("No attendance records found for this email");
      }
    } catch (err) {
      setReports([]);
      setMsg(err.response?.data?.message || "Error fetching attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        bgcolor: "#eef1f6",
        p: "40px 20px",
      }}
    >
      <Box
        sx={{
          width: "700px",
          bgcolor: "#fff",
          p: "25px 35px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 3, color: "#007bff", fontWeight: 600 }}
        >
          Search Attendance Calendar
        </Typography>

        {/* Search Section */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            type="email"
            placeholder="Enter employee email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            size="small"
          />
          <Button
            onClick={handleSearch}
            disabled={loading}
            variant="contained"
            sx={{ bgcolor: "#007bff" }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Search"}
          </Button>
        </Box>

        {msg && (
          <Alert severity={reports.length > 0 ? "info" : "error"} sx={{ mb: 2 }}>
            {msg}
          </Alert>
        )}

        {/* Attendance Calendar */}
        {reports.length > 0 && (
          <Box
            sx={{
              width: 350,
              p: 3,
              borderRadius: 2,
              boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
              bgcolor: "#f4f6f8",
              textAlign: "center",
              mx: "auto",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              {email}
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              < DateCalendar 
                slots={{
                  day: (props) => {
                    const date = props.day.toDate();
                    const found = reports.find((r) =>
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
          </Box>
        )}
      </Box>
    </Box>
  );
}
