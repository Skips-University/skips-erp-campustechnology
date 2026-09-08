// IDCardManager.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import generateIDCardsPDF from "../utils/generateIdcard";

const BulkIDCardGenerator = () => {
  const [year, setYear] = useState("");
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (year) {
      axios
        .get(`http://localhost:8080/api/v2/users/programs?year=${year}`)
        .then((res) => setPrograms(res.data))
        .catch((err) => {
          alert("Failed to load programs.");
        });
      setSelectedProgram("");
      setSemesters([]);
      setSelectedSemester("");
    }
  }, [year]);

  useEffect(() => {
    if (year && selectedProgram) {
      axios
        .get(`http://localhost:8080/api/v2/users/semesters?year=${year}&program=${selectedProgram}`)
        .then((res) => setSemesters(res.data))
        .catch((err) => {
          alert("Failed to load semesters.");
        });
      setSelectedSemester("");
    }
  }, [year, selectedProgram]);

  const fetchUsers = () => {
    if (!year || !selectedProgram || !selectedSemester) {
      alert("Please select all filters.");
      return;
    }
    axios
      .get("http://localhost:8080/api/v2/users/filter", {
        params: {
          admissionyear: year,
          programcode: selectedProgram,
          semester: selectedSemester,
        },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => {
        alert("Failed to load users.");
      });
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'white', boxShadow: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight="medium" gutterBottom>
        Bulk ID Card Generator
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Select Year</InputLabel>
        <Select value={year} label="Select Year" onChange={(e) => setYear(e.target.value)}>
          <MenuItem value="">-- Select --</MenuItem>
          <MenuItem value="2022">2022</MenuItem>
          <MenuItem value="2023">2023</MenuItem>
          <MenuItem value="2024">2024</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" disabled={!programs.length}>
        <InputLabel>Select Program</InputLabel>
        <Select value={selectedProgram} label="Select Program" onChange={(e) => setSelectedProgram(e.target.value)}>
          <MenuItem value="">-- Select --</MenuItem>
          {programs.map((p) => (
            <MenuItem key={p} value={p}>{p}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" disabled={!semesters.length}>
        <InputLabel>Select Semester</InputLabel>
        <Select value={selectedSemester} label="Select Semester" onChange={(e) => setSelectedSemester(e.target.value)}>
          <MenuItem value="">-- Select --</MenuItem>
          {semesters.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button variant="outlined" color="primary" onClick={fetchUsers}>
          Fetch Students
        </Button>
        <Button variant="contained" color="success" onClick={() => generateIDCardsPDF(users)} disabled={!users.length}>
          {users.length ? "Generate PDF" : "No Data"}
        </Button>
      </Box>
    </Box>
  );
};

export default BulkIDCardGenerator;