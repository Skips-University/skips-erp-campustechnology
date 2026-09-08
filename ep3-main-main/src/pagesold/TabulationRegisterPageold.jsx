import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ep1 from "../api/ep1";
import global1 from "./global1";

function TabulationRegisterPage() {
  const [searchParams, setSearchParams] = useState({
    regno: "",
    program: "",
    branch: "",
    regulation: "",
    year: "",
    semester: "",
  });

  const [studentData, setStudentData] = useState(null);
  const [currentSemData, setCurrentSemData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [availableData, setAvailableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const years = Array.from({ length: 15 }, (_, i) => 2020 + i);

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (searchParams.program && searchParams.branch && searchParams.regulation) {
      fetchAvailableData();
    } else {
      setAvailableData([]);
    }
  }, [searchParams.program, searchParams.branch, searchParams.regulation]);

  const fetchAvailableData = async () => {
    try {
      const res = await ep1.get("/api/v2/getavailabledata", {
        params: {
          colid: global1.colid,
          program: searchParams.program,
          branch: searchParams.branch,
          regulation: searchParams.regulation,
        },
      });
      setAvailableData(res.data.availableData);
    } catch (error) {
      console.error("Error fetching available data:", error);
      setAvailableData([]);
    }
  };

  const handleGenerate = async () => {
    if (
      !searchParams.regno ||
      !searchParams.program ||
      !searchParams.branch ||
      !searchParams.regulation ||
      !searchParams.year ||
      !searchParams.semester
    ) {
      setError("Please enter all fields");
      return;
    }

    setLoading(true);
    setError("");
    setStudentData(null);
    setCurrentSemData(null);
    setSummaryData(null);

    try {
      const studentRes = await ep1.get(
        "/api/v2/getstudentinfofortabulation",
        {
          params: { colid: global1.colid, regno: searchParams.regno },
        }
      );
      setStudentData(studentRes.data.student);

      const marksRes = await ep1.get("/api/v2/getcurrentsemmarks", {
        params: {
          colid: global1.colid,
          regno: searchParams.regno,
          semester: searchParams.semester,
          year: searchParams.year,
          program: searchParams.program,
          regulation: searchParams.regulation,
          branch: searchParams.branch,
        },
      });
      setCurrentSemData(marksRes.data.currentSemester);

      const summaryRes = await ep1.get("/api/v2/getallsemestersummary", {
        params: {
          colid: global1.colid,
          regno: searchParams.regno,
          program: searchParams.program,
        },
      });
      setSummaryData(summaryRes.data);
    } catch (error) {
      setError("Failed to generate: " + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const availableSemesters = availableData.map((d) => String(d.semester));

  // Create 8 semester columns (1-8)
  const allEightSemesters = Array.from({ length: 8 }, (_, i) => i + 1);

  // Helper function to get semester data
  const getSemesterData = (semNum) => {
    return summaryData?.semesterSummary.find((s) => s.semester === semNum) || null;
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Search Form */}
      <Card sx={{ mb: 2 }} className="no-print">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tabulation Register
          </Typography>

          <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Registration Number"
                name="regno"
                value={searchParams.regno}
                onChange={handleChange}
                placeholder="REG007"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Program"
                name="program"
                value={searchParams.program}
                onChange={handleChange}
                placeholder="B.Tech CSE"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Branch"
                name="branch"
                value={searchParams.branch}
                onChange={handleChange}
                placeholder="CSE"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Regulation"
                name="regulation"
                value={searchParams.regulation}
                onChange={handleChange}
                placeholder="2021"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                label="Year"
                name="year"
                value={searchParams.year}
                onChange={handleChange}
                size="small"
              >
                {years.map((y) => (
                  <MenuItem key={y} value={String(y)}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                label="Semester"
                name="semester"
                value={searchParams.semester}
                onChange={handleChange}
                disabled={availableSemesters.length === 0}
                size="small"
              >
                {availableSemesters.map((s) => (
                  <MenuItem key={s} value={s}>
                    SEM {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={loading || availableSemesters.length === 0}
              size="small"
            >
              {loading ? <CircularProgress size={20} /> : "GENERATE"}
            </Button>
            {error && (
              <Alert severity="error" sx={{ flex: 1, mb: 0 }}>
                {error}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* TABULATION REGISTER - LANDSCAPE FULL SIZE */}
      {studentData && currentSemData && summaryData && (
        <>
          <Box className="no-print" sx={{ mb: 1, textAlign: "right" }}>
            <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} size="small">
              PRINT
            </Button>
          </Box>

          <Box
            id="printable-area"
            sx={{
              bgcolor: "white",
              p: 1,
              border: "2px solid #000",
              minHeight: "100vh",
              width: "100%",
              overflowX: "auto",
            }}
          >
            {/* HEADER */}
            <Box sx={{ textAlign: "center", mb: 1, borderBottom: "2px solid #000", pb: 0.8 }}>
              <Typography sx={{ fontSize: "1rem", fontWeight: "bold" }}>
                DIPLOMA COMPUTER SCIENCE ENGINEERING
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                SEMESTER {currentSemData.semester} {currentSemData.month?.toUpperCase()} {currentSemData.year}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                TABULATION REGISTER
              </Typography>
            </Box>

            {/* STUDENT INFO */}
            <Box sx={{ fontSize: "0.8rem", mb: 1, p: 1, border: "1px solid #000", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
              <Box>
                <Typography sx={{ fontSize: "0.8rem" }}>
                  <strong>Enrollment No:</strong> {studentData.enrollmentNo}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem" }}>
                  <strong>Name:</strong> {studentData.name}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.8rem" }}>
                  <strong>Father Name:</strong> {studentData.fathername}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem" }}>
                  <strong>Mother Name:</strong> {studentData.mothername}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.8rem" }}>
                  <strong>Gender:</strong> {studentData.gender}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem" }}>
                  <strong>CGPA:</strong> {summaryData?.cgpa}
                </Typography>
              </Box>
            </Box>

            {/* MAIN TABLE: LEFT (Marks) + RIGHT (All 8 Semesters) */}
            <Box sx={{ display: "flex", gap: 0, border: "2px solid #000" }}>
              {/* LEFT SIDE - CURRENT SEMESTER MARKS */}
              <Box sx={{ flex: "0 0 55%", borderRight: "2px solid #000", p: 1, overflow: "auto" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: "bold", mb: 0.8 }}>
                  Current Semester - {currentSemData.month?.toUpperCase()} {currentSemData.year} (SEM {currentSemData.semester})
                </Typography>

                <Table size="small" sx={{ mb: 1 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#d0d0d0" }}>
                      {["Paper Code", "Paper Name", "T/P", "SE", "IA", "Credit", "Total", "Per(%)", "Grade", "GP"].map((h) => (
                        <TableCell
                          key={h}
                          sx={{
                            border: "1px solid #000",
                            fontSize: "0.7rem",
                            p: "4px",
                            fontWeight: "bold",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentSemData.marks.map((mark, idx) => {
                      // Calculate separate for Theory and Practical
                      const theoryTotal = (mark.thObtained || 0) + (mark.iatObtained || 0);
                      const theoryMax = (mark.thMax || 0) + (mark.iatMax || 0);
                      const theoryPercentage = theoryMax > 0 ? ((theoryTotal / theoryMax) * 100).toFixed(2) : 0;
                      const theoryGradePoint = theoryPercentage >= 90 ? "10" : theoryPercentage >= 80 ? "9" : theoryPercentage >= 70 ? "8" : theoryPercentage >= 60 ? "7" : theoryPercentage >= 50 ? "6" : theoryPercentage >= 40 ? "5" : theoryPercentage >= 36 ? "4" : "0";
                      const theoryGrade = theoryPercentage >= 90 ? "O" : theoryPercentage >= 80 ? "A+" : theoryPercentage >= 70 ? "A" : theoryPercentage >= 60 ? "B+" : theoryPercentage >= 50 ? "B" : theoryPercentage >= 40 ? "C" : theoryPercentage >= 36 ? "P" : "F";

                      const practicalTotal = (mark.prObtained || 0) + (mark.iapObtained || 0);
                      const practicalMax = (mark.prMax || 0) + (mark.iapMax || 0);
                      const practicalPercentage = practicalMax > 0 ? ((practicalTotal / practicalMax) * 100).toFixed(2) : 0;
                      const practicalGradePoint = practicalPercentage >= 90 ? "10" : practicalPercentage >= 80 ? "9" : practicalPercentage >= 70 ? "8" : practicalPercentage >= 60 ? "7" : practicalPercentage >= 50 ? "6" : practicalPercentage >= 40 ? "5" : practicalPercentage >= 36 ? "4" : "0";
                      const practicalGrade = practicalPercentage >= 90 ? "O" : practicalPercentage >= 80 ? "A+" : practicalPercentage >= 70 ? "A" : practicalPercentage >= 60 ? "B+" : practicalPercentage >= 50 ? "B" : practicalPercentage >= 40 ? "C" : practicalPercentage >= 36 ? "P" : "F";

                      return (
                        <React.Fragment key={idx}>
                          {/* THEORY ROW */}
                          {mark.thMax && mark.thMax > 0 && (
                            <TableRow>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", whiteSpace: "nowrap" }}>
                                {mark.paperCode}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", whiteSpace: "nowrap" }}>
                                {mark.paperName}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center", fontWeight: "bold" }}>
                                T
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center" }}>
                                {mark.thObtained}/{mark.thMax}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center" }}>
                                {mark.iatObtained}/{mark.iatMax}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center" }}>
                                {mark.credit}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center", fontWeight: "bold" }}>
                                {theoryTotal}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center" }}>
                                {theoryPercentage}%
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.7rem",
                                  p: "4px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  bgcolor: theoryPercentage < 36 ? "#ffcdd2" : "#c8e6c9",
                                }}
                              >
                                {theoryGrade}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center" }}>
                                {theoryGradePoint}
                              </TableCell>
                            </TableRow>
                          )}

                          {/* PRACTICAL ROW */}
                          {mark.prMax && mark.prMax > 0 && (
                            <TableRow>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", whiteSpace: "nowrap" }}>
                                {mark.paperCode}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", whiteSpace: "nowrap" }}>
                                {mark.paperName}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center", fontWeight: "bold" }}>
                                P
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center" }}>
                                {mark.prObtained}/{mark.prMax}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center" }}>
                                {mark.iapObtained}/{mark.iapMax}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center" }}>
                                {mark.credit}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center", fontWeight: "bold" }}>
                                {practicalTotal}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center" }}>
                                {practicalPercentage}%
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.7rem",
                                  p: "4px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  bgcolor: practicalPercentage < 36 ? "#ffcdd2" : "#c8e6c9",
                                }}
                              >
                                {practicalGrade}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", textAlign: "center" }}>
                                {practicalGradePoint}
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* GRAND TOTAL ROW */}
                    <TableRow sx={{ bgcolor: "#fff9c4" }}>
                      <TableCell colSpan={6} sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", fontWeight: "bold", textAlign: "right" }}>
                        GRAND TOTAL:
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", fontWeight: "bold", textAlign: "center" }}>
                        {currentSemData.totalObtained}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", fontWeight: "bold", textAlign: "center" }}>
                        {currentSemData.percentage}%
                      </TableCell>
                      <TableCell colSpan={2} sx={{ border: "1px solid #000", fontSize: "0.7rem", p: "4px", fontWeight: "bold", textAlign: "center" }}>
                        SGPA: {currentSemData.sgpa}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Status Boxes */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px" }}>
                  <Box sx={{ border: "1px solid #000", p: 0.8, bgcolor: "#f5f5f5" }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: "bold" }}>Failed Papers:</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#d32f2f", fontWeight: "bold" }}>
                      {currentSemData.failedPapers}
                    </Typography>
                  </Box>
                  <Box sx={{ border: "1px solid #000", p: 0.8, bgcolor: "#f5f5f5" }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: "bold" }}>Result:</Typography>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: "bold" }}>{currentSemData.result}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* RIGHT SIDE - ALL 8 SEMESTERS (WITH EMPTY COLUMNS) */}
              <Box sx={{ flex: "0 0 45%", p: 1, overflow: "auto" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: "bold", mb: 0.8, textAlign: "center" }}>
                  Academic Record - All 8 Semesters
                </Typography>

                <Table size="small" sx={{ border: "1px solid #000", minWidth: "900px" }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#d0d0d0" }}>
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          fontSize: "0.75rem",
                          p: "3px",
                          fontWeight: "bold",
                          textAlign: "center",
                          minWidth: "80px",
                        }}
                      >
                        Particulars
                      </TableCell>
                      {allEightSemesters.map((sem) => (
                        <TableCell
                          key={sem}
                          sx={{
                            border: "1px solid #000",
                            fontSize: "0.75rem",
                            p: "3px",
                            fontWeight: "bold",
                            textAlign: "center",
                            minWidth: "75px",
                            whiteSpace: "nowrap",
                            bgcolor: getSemesterData(sem) ? "#fff" : "#f0f0f0",
                          }}
                        >
                          SEM {sem}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { label: "Month/Year", key: "monthYear" },
                      { label: "Total Marks", key: "total" },
                      { label: "Percentage", key: "percentage" },
                      { label: "SGPA", key: "sgpa" },
                      { label: "Credits", key: "credits" },
                      { label: "Result", key: "result" },
                    ].map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell
                          sx={{
                            border: "1px solid #000",
                            fontSize: "0.75rem",
                            p: "3px",
                            fontWeight: "bold",
                            minWidth: "80px",
                          }}
                        >
                          {row.label}
                        </TableCell>
                        {allEightSemesters.map((sem) => {
                          const semData = getSemesterData(sem);
                          return (
                            <TableCell
                              key={sem}
                              sx={{
                                border: "1px solid #000",
                                fontSize: "0.75rem",
                                p: "3px",
                                textAlign: "center",
                                minWidth: "75px",
                                bgcolor:
                                  row.key === "result" && semData?.result === "Fail"
                                    ? "#ffcdd2"
                                    : row.key === "result" && semData?.result === "Pass"
                                    ? "#c8e6c9"
                                    : semData
                                    ? "#fff"
                                    : "#f0f0f0",
                                fontWeight: row.key === "result" ? "bold" : "normal",
                              }}
                            >
                              {semData
                                ? row.key === "monthYear"
                                  ? `${semData.month?.substring(0, 3)}/${semData.year}`
                                  : row.key === "total"
                                  ? `${semData.total}/${semData.maxTotal}`
                                  : row.key === "percentage"
                                  ? `${semData.percentage}%`
                                  : semData[row.key]
                                : ""}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: "#e8f5e9", fontWeight: "bold" }}>
                      <TableCell sx={{ border: "1px solid #000", fontSize: "0.75rem", p: "3px", fontWeight: "bold", minWidth: "80px" }}>
                        CGPA
                      </TableCell>
                      <TableCell
                        colSpan={8}
                        sx={{
                          border: "1px solid #000",
                          fontSize: "0.85rem",
                          p: "3px",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {summaryData?.cgpa}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* FOOTER */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mt: 3, pt: 3, borderTop: "2px solid #000" }}>
              {["Tabulator-1", "Tabulator-2", "Chief Tabulator", "Principal"].map((sig) => (
                <Box key={sig} sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: "bold", mt: 4 }}>
                    {sig}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ textAlign: "right", mt: 2 }}>
              <Typography sx={{ fontSize: "0.75rem", fontStyle: "italic" }}>
                Generated: {new Date().toLocaleDateString("en-IN")}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* PRINT STYLES - LANDSCAPE */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: A3 landscape; margin: 3mm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
          table { page-break-inside: avoid; }
          #printable-area { min-height: auto; }
        }
      `}</style>
    </Box>
  );
}

export default TabulationRegisterPage;
