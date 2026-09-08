import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function MarksEntryPageds() {
  const [regno, setRegno] = useState("");
  const [studentData, setStudentData] = useState({
    name: "",
    fathername: "",
    mothername: "",
    gender: "",
    regno: "",
  });
  const [searchParams, setSearchParams] = useState({
    program: "",
    month: "",
    year: "",
    status: "",
    regulation: "",
    semester: "",
    branch: "",
  });
  const [papers, setPapers] = useState([]);
  const [marksData, setMarksData] = useState([]);

   const navigate = useNavigate();
   
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 15 }, (_, i) => 2020 + i);
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const handleSearchStudent = async () => {
    try {
      const res = await ep1.get("/api/v2/getstudentds", {
        params: { colid: global1.colid, regno },
      });
      setStudentData({
        name: res.data.name || "",
        fathername: res.data.fathername || "",
        mothername: res.data.mothername || "",
        gender: res.data.gender || "",
        regno: res.data.regno || "",
      });
      alert("Student found!");
    } catch (error) {
      console.error(error);
      // CLEAR STUDENT DATA WHEN NOT FOUND
    setStudentData({
      name: "",
      fathername: "",
      mothername: "",
      gender: "",
      regno: "",
    });
    // ALSO CLEAR PAPERS AND MARKS
    setPapers([]);
    setMarksData([]);
    alert("Student not found");
    }
  };

  const handleStudentDataChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleFetchPapers = async () => {
    try {
      if (!studentData.regno) {
        alert("Please search for a student first");
        return;
      }

      // Fetch paper structure
      const paperRes = await ep1.get("/api/v2/listexammarks1ds", {
        params: {
          colid: Number(global1.colid),
          program: searchParams.program,
          year: searchParams.year,
          month: searchParams.month,
          semester: searchParams.semester,
          branch: searchParams.branch,
          regulation: searchParams.regulation,
          status: searchParams.status,
        },
      });
      setPapers(paperRes.data);
      
      // Fetch existing marks for this student
      const marksRes = await ep1.get("/api/v2/listexammarks2ds", {
        params: {
          colid: global1.colid,
          regno: studentData.regno,
          program: searchParams.program,
          year: searchParams.year,
          month: searchParams.month,
          semester: searchParams.semester,
          branch: searchParams.branch,
          regulation: searchParams.regulation,
          status: searchParams.status,
        },
      });

      const existingMarks = marksRes.data;

      // Initialize marks data with existing marks if available
      const initialMarks = paperRes.data.map((paper) => {
        const existing = existingMarks.find(m => m.papercode === paper.papercode);
        
        return {
          _id: existing?._id || null, // Store ID for update
          papercode: paper.papercode,
          papername: paper.papername,
          thmax: paper.thmax,
          thobtained: existing?.thobtained || "",
          prmax: paper.prmax,
          probtained: existing?.probtained || "",
          iatmax: paper.iatmax,
          iatobtained: existing?.iatobtained || "",
          iapmax: paper.iapmax,
          iapobtained: existing?.iapobtained || "",
        };
      });
      setMarksData(initialMarks);

      if (existingMarks.length > 0) {
        alert("Existing marks found! You can edit them.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch papers");
    }
  };

  const handleMarksChange = (index, field, value) => {
    const updated = [...marksData];
    updated[index][field] = value;
    setMarksData(updated);
  };

  const handleSubmit = async () => {
    try {
      if (!studentData.name || !studentData.regno) {
        alert("Please enter student name and regno");
        return;
      }

      const submissions = marksData.map((mark) => ({
        _id: mark._id, // Include ID for update
        name: global1.name,
        user: global1.user,
        colid: Number(global1.colid),
        student: studentData.name,
        regno: studentData.regno,
        mothername: studentData.mothername,
        fathername: studentData.fathername,
        gender: studentData.gender,
        program: searchParams.program,
        examcode: papers[0]?.examcode || "",
        month: searchParams.month,
        year: searchParams.year,
        status: searchParams.status,
        regulation: searchParams.regulation,
        semester: searchParams.semester,
        branch: searchParams.branch,
        papercode: mark.papercode,
        papername: mark.papername,
        thmax: mark.thmax,
        thobtained: mark.thobtained || 0,
        prmax: mark.prmax,
        probtained: mark.probtained || 0,
        iatmax: mark.iatmax,
        iatobtained: mark.iatobtained || 0,
        iapmax: mark.iapmax,
        iapobtained: mark.iapobtained || 0,
      }));

      // Use edit endpoint if marks exist, create if new
      await Promise.all(
        submissions.map((data) => {
          if (data._id) {
            return ep1.post("/api/v2/editexammarks2ds", data);
          } else {
            return ep1.post("/api/v2/createexammarks2ds", data);
          }
        })
      );

      alert("Marks saved successfully!");
      handleFetchPapers(); // Reload to show updated marks
    } catch (error) {
      console.error(error);
      alert("Failed to submit marks");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                      startIcon={<ArrowBack />}
                      onClick={() => navigate("/dashboardreevalds")}
                    >
                      Back to Reeval Dashboard
                    </Button>
                    <Button
                      startIcon={<ArrowBack />}
                      onClick={() => navigate("/dashdashfacnew")}
                    >
                      Back
                    </Button>
                      <Typography variant="h4" gutterBottom>
        Marks Entry
      </Typography>
                  </Box>

      {/* Student Search Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search Student
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Enrollment No"
                value={regno}
                onChange={(e) => setRegno(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="contained" color="primary" onClick={handleSearchStudent}>
                Search Student
              </Button>
            </Grid>
          </Grid>

          {/* Editable Student Information */}
          {studentData.regno && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Student Information (Editable)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Student Name"
                    name="name"
                    value={studentData.name}
                    onChange={handleStudentDataChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Enrollment No"
                    name="regno"
                    value={studentData.regno}
                    onChange={handleStudentDataChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Father Name"
                    name="fathername"
                    value={studentData.fathername}
                    onChange={handleStudentDataChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Mother Name"
                    name="mothername"
                    value={studentData.mothername}
                    onChange={handleStudentDataChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={studentData.gender}
                    onChange={handleStudentDataChange}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Exam Details Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Exam Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Program"
                name="program"
                value={searchParams.program}
                onChange={(e) => setSearchParams({ ...searchParams, program: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Month"
                value={searchParams.month}
                onChange={(e) => setSearchParams({ ...searchParams, month: e.target.value })}
              >
                {months.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Year"
                value={searchParams.year}
                onChange={(e) => setSearchParams({ ...searchParams, year: e.target.value })}
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Status"
                value={searchParams.status}
                onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Regulation"
                value={searchParams.regulation}
                onChange={(e) => setSearchParams({ ...searchParams, regulation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Semester"
                value={searchParams.semester}
                onChange={(e) => setSearchParams({ ...searchParams, semester: e.target.value })}
              >
                {semesters.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Branch"
                value={searchParams.branch}
                onChange={(e) => setSearchParams({ ...searchParams, branch: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="contained" color="secondary" onClick={handleFetchPapers}>
                Load Papers
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Marks Entry Table */}
      {papers.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Marks Table
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Paper Code</strong></TableCell>
                  <TableCell><strong>Paper Name</strong></TableCell>
                  <TableCell><strong>TH Max</strong></TableCell>
                  <TableCell><strong>Theory</strong></TableCell>
                  <TableCell><strong>PR Max</strong></TableCell>
                  <TableCell><strong>Practical</strong></TableCell>
                  <TableCell><strong>IAT Max</strong></TableCell>
                  <TableCell><strong>Theory IA</strong></TableCell>
                  <TableCell><strong>IAP Max</strong></TableCell>
                  <TableCell><strong>Practical IA</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marksData.map((mark, index) => (
                  <TableRow key={index}>
                    <TableCell>{mark.papercode}</TableCell>
                    <TableCell>{mark.papername}</TableCell>
                    <TableCell>{mark.thmax}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={mark.thobtained}
                        onChange={(e) => handleMarksChange(index, "thobtained", e.target.value)}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>{mark.prmax || ""}</TableCell>
                    <TableCell>
                      {mark.prmax > 0 ? (
                        <TextField
                          size="small"
                          type="number"
                          value={mark.probtained}
                          onChange={(e) => handleMarksChange(index, "probtained", e.target.value)}
                          sx={{ width: 80 }}
                        />
                      ) : null}
                    </TableCell>
                    <TableCell>{mark.iatmax}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={mark.iatobtained}
                        onChange={(e) => handleMarksChange(index, "iatobtained", e.target.value)}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>{mark.iapmax || ""}</TableCell>
                    <TableCell>
                      {mark.iapmax > 0 ? (
                        <TextField
                          size="small"
                          type="number"
                          value={mark.iapobtained}
                          onChange={(e) => handleMarksChange(index, "iapobtained", e.target.value)}
                          sx={{ width: 80 }}
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Save Marks
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default MarksEntryPageds;
