import React, { useState, useEffect } from "react";
import ep1 from "../api/ep1";
import {
  LocalizationProvider,
} from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
import { styled } from "@mui/material/styles";
import { Box, Typography, Alert } from "@mui/material";

// Custom styled day for attendance
const CustomDay = styled(PickersDay)(({ status }) => ({
  ...(status === "full-day" && {
    backgroundColor: "#28a745",
    color: "#fff",
    borderRadius: "50%",
    "&:hover, &:focus": { backgroundColor: "#218838" },
  }),
  ...(status === "half-day" && {
    backgroundColor: "#ffc107",
    color: "#fff",
    borderRadius: "50%",
    "&:hover, &:focus": { backgroundColor: "#e0a800" },
  }),
}));

const AttendanceCalendar = () => {
  const [reports, setReports] = useState([]);
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

  const fetchAllAttendance = async () => {
    try {
      const res = await ep1.get("/api/v2/getallattendancesj");
      setReports(res.data.reports || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance data");
    }
  };

  useEffect(() => {
    fetchAllAttendance();
  }, []);

  // group reports by email
  const groupedReports = reports.reduce((acc, report) => {
    if (!acc[report.email]) acc[report.email] = [];
    acc[report.email].push(report);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 3, fontWeight: 600, color: "#333" }}
      >
        Attendance Calendars
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, textAlign: "center" }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
        }}
      >
        {Object.entries(groupedReports).map(([email, userReports]) => (
          <Box
            key={email}
            sx={{
              width: 350,
              p: 3,
              borderRadius: 2,
              boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
              bgcolor: "#f4f6f8",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              {email}
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs} >
              <DateCalendar
                slots={{
                  day: (props) => {
                    const date = props.day.toDate();
                    const found = userReports.find((r) =>
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
        ))}
      </Box>
    </Box>
  );
};

export default AttendanceCalendar;
