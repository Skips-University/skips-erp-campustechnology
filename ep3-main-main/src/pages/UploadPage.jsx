import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
  List,
  ListItem,
  Divider,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DownloadIcon from "@mui/icons-material/Download";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ep1 from "../api/ep1";
import axios from "axios";
import global1 from "./global1";

export default function UploadPage() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [programCode, setProgramCode] = useState("");
  const [year, setYear] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { classId } = location.state || {};
  const [marking, setMarking] = useState(false);
  const [attendanceList, setAttendanceList] = useState(null);

  useEffect(() => {
    if (!global1.colid) {
      navigate("/");
    }
  }, [navigate]);

  const submit = async () => {
    if (!image) {
      alert("Please select an image.");
      return;
    }

    if (
      year &&
      (!/^\d{4}$/.test(year) ||
        parseInt(year) < 1900 ||
        parseInt(year) > 2100)
    ) {
      alert("Please enter a valid 4-digit year.");
      return;
    }

    const colid = global1.colid;
    const fd = new FormData();
    fd.append("image", image);
    fd.append("colid", colid);
    fd.append("program_code", programCode);
    fd.append("year", year);
    fd.append("classId", classId);

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(
        "http://4.240.102.83:5000/api/attendance_upload",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    if (!result || !result.present || result.present.length === 0) {
      alert("No present students to mark attendance.");
      return;
    }

    const colid = global1.colid;
    setMarking(true);

    try {
      const newAttendanceList = result.present.map((studentName) => ({
        name: studentName,
        user: global1.user,
        colid,
        year,
        programcode: programCode,
        program: "",
        course: "",
        coursecode: "",
        regno: "",
        att: 1,
        classdate: new Date().toISOString(),
        semester: "",
        section: "",
        status1: "Recorded",
      }));

      await ep1.post("/api/v2/markclassattendance", {
        classid: classId,
        attendanceList: newAttendanceList,
      });

      setAttendanceList(newAttendanceList);
      alert("Attendance marked successfully!");
    } catch (err) {
      console.error("Error marking attendance:", err);
      alert("Failed to mark attendance.");
    } finally {
      setMarking(false);
    }
  };

  const downloadAttendance = () => {
    if (!attendanceList) return;
    const blob = new Blob([JSON.stringify(attendanceList, null, 2)], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${classId}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setImage(null);
    setProgramCode("");
    setYear("");
    setResult(null);
    setAttendanceList(null);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
        <Typography
          variant="h5"
          align="center"
          sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}
        >
          Upload Group Photo
        </Typography>

        {/* File Upload */}
        <Button
          fullWidth
          variant="outlined"
          component="label"
          disabled={loading}
          startIcon={<CloudUploadIcon />}
          sx={{ mb: 2 }}
        >
          {image ? image.name : "Choose an image"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />
        </Button>

        {/* Program Code */}
        <TextField
          fullWidth
          label="Program Code"
          variant="outlined"
          value={programCode}
          onChange={(e) => setProgramCode(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        {/* Year */}
        <TextField
          fullWidth
          label="Year"
          variant="outlined"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          disabled={loading}
          inputProps={{ maxLength: 4 }}
          sx={{ mb: 3 }}
        />

        {/* Upload Button */}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={submit}
          disabled={loading}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
              Processing...
            </>
          ) : (
            "Upload"
          )}
        </Button>

        {loading && (
          <Typography align="center" sx={{ mt: 2, color: "text.secondary" }}>
            Detecting faces, please wait...
          </Typography>
        )}

        {/* Results */}
        {result && !loading && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Total Faces Detected:</strong> {result.total}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Unknown Faces:</strong> {result.unknown}
            </Typography>

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Present Students
            </Typography>

            {result.present.length === 0 ? (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No known faces found
              </Typography>
            ) : (
              <List dense>
                {result.present.map((name, idx) => (
                  <React.Fragment key={idx}>
                    <ListItem>{name}</ListItem>
                    {idx !== result.present.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}

            <Stack direction="column" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="success"
                onClick={markAttendance}
                disabled={marking}
                startIcon={<DoneAllIcon />}
              >
                {marking ? "Saving..." : "Mark Attendance"}
              </Button>

              {attendanceList && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={downloadAttendance}
                  startIcon={<DownloadIcon />}
                >
                  Download Marked Attendance
                </Button>
              )}

              <Button
                variant="contained"
                color="error"
                onClick={resetForm}
                startIcon={<RestartAltIcon />}
              >
                Reset
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
