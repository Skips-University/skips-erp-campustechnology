import React, { useEffect, useState } from "react";
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar
} from "@mui/material";
import axios from "axios";
import ep1 from '../api/ep1';
import global1 from '../pages/global1';

// // 👉 Global object
// const global1 = {
//   regno: "123",
//   colid: 1
// };

export default function ExForm() {
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);

  const [semester, setSemester] = useState("");
  const [course, setCourse] = useState("");

  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  // 👉 Load semesters
  useEffect(() => {
    ep1
    //   .get("http://localhost:5000/ex-get-semesters", {
    .get("/ex-get-semesters", {
        params: {
          regno: global1.regno,
          colid: global1.colid
        }
      })
      .then((res) => setSemesters(res.data));
  }, []);

  // 👉 Load courses based on semester
  const handleSemesterChange = (value) => {
    setSemester(value);

    // axios
    //   .get("http://localhost:5000/ex-get-courses", {
    ep1
      .get("/ex-get-courses", {
        params: {
          regno: global1.regno,
          semester: value,
          colid: global1.colid
        }
      })
      .then((res) => setCourses(res.data));
  };

  // 👉 Submit
  const handleSubmit = () => {
    // axios
    //   .post("http://localhost:5000/ex-check-insert", {
    ep1
      .post("/ex-check-insert", {
        regno: global1.regno,
        semester,
        course,
        colid: global1.colid
      })
      .then((res) => {
        setMsg(res.data.message);
        setOpen(true);
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Exam Admit</h2>

      {/* Semester Dropdown */}
      <FormControl fullWidth style={{ marginBottom: 20 }}>
        <InputLabel>Semester</InputLabel>
        <Select
          value={semester}
          onChange={(e) => handleSemesterChange(e.target.value)}
        >
          {semesters.map((sem, i) => (
            <MenuItem key={i} value={sem}>
              {sem}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Course Dropdown */}
      <FormControl fullWidth style={{ marginBottom: 20 }}>
        <InputLabel>Course</InputLabel>
        <Select value={course} onChange={(e) => setCourse(e.target.value)}>
          {courses.map((c, i) => (
            <MenuItem key={i} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Submit */}
      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>

      {/* Popup */}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        message={msg}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}