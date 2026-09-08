import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
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
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const years = Array.from({ length: 15 }, (_, i) => 2020 + i);

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (
      searchParams.program &&
      searchParams.branch &&
      searchParams.regulation
    ) {
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
      const studentRes = await ep1.get("/api/v2/getstudentinfofortabulation", {
        params: { colid: global1.colid, regno: searchParams.regno },
      });
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
      setError(
        "Failed to generate: " +
          (error.response?.data?.message || error.message)
      );
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const availableSemesters = availableData.map((d) => String(d.semester));

  // Create 8 semester columns (1-8)
  const allEightSemesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // Helper function to get semester data
  const getSemesterData = (semNum) => {
    if (!summaryData || !summaryData.semesterSummary) return null;
    return (
      summaryData.semesterSummary.find(
        (s) => parseInt(s.semester) === semNum
      ) || null
    );
  };

  return (
    <Box sx={{ p: 2, width: "100%", overflowX: "auto" }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/dashboardreevalds")}
        >
          Back
        </Button>
      </Box>
      {/* Search Form */}
      <Card sx={{ mb: 2 }} className="no-print">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tabulation Register
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
              mb: 2,
            }}
          >
            <TextField
              label="Registration Number"
              name="regno"
              value={searchParams.regno}
              onChange={handleChange}
              placeholder="REG007"
              size="small"
            />
            <TextField
              label="Program"
              name="program"
              value={searchParams.program}
              onChange={handleChange}
              placeholder="B.Tech CSE"
              size="small"
            />
            <TextField
              label="Branch"
              name="branch"
              value={searchParams.branch}
              onChange={handleChange}
              placeholder="CSE"
              size="small"
            />
            <TextField
              label="Regulation"
              name="regulation"
              value={searchParams.regulation}
              onChange={handleChange}
              placeholder="2021"
              size="small"
            />
            <TextField
              select
              label="Year"
              name="year"
              value={searchParams.year}
              onChange={handleChange}
              size="small"
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Semester"
              name="semester"
              value={searchParams.semester}
              onChange={handleChange}
              size="small"
            >
              {availableSemesters.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading}
            sx={{ height: "40px" }}
          >
            {loading ? <CircularProgress size={20} /> : "GENERATE"}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* TABULATION REGISTER - FULL WIDTH */}
      {studentData && currentSemData && summaryData && (
        <>
          <Box className="no-print" sx={{ mb: 2, textAlign: "right" }}>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              size="small"
            >
              PRINT
            </Button>
          </Box>

          <Box
            id="printable-area"
            sx={{
              bgcolor: "white",
              p: 2,
              border: "3px solid #000",
              width: "100%",
              minWidth: "1200px",
            }}
          >
            {/* HEADER */}
            {/* HEADER - CENTERED */}
            <Box
              sx={{
                textAlign: "center",
                mb: 2,
                borderBottom: "2px solid #000",
                pb: 1,
              }}
            >
              <Typography sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                {currentSemData.program}
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                SEMESTER {currentSemData.semester}{" "}
                {currentSemData.month?.toUpperCase()} {currentSemData.year}
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: "bold" }}>
                TABULATION REGISTER
              </Typography>
            </Box>

            {/* STUDENT INFO */}
            <Box
              sx={{
                border: "2px solid #000",
                p: 1,
                mb: 2,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 1,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: "0.75rem" }}>
                  <strong>Enrollment No:</strong> {studentData.enrollmentNo}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem" }}>
                  <strong>Name:</strong> {studentData.name}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.75rem" }}>
                  <strong>Father Name:</strong> {studentData.fathername}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem" }}>
                  <strong>Mother Name:</strong> {studentData.mothername}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.75rem" }}>
                  <strong>Gender:</strong> {studentData.gender}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem" }}>
                  <strong>CGPA:</strong> {summaryData?.cgpa}
                </Typography>
              </Box>
            </Box>

            {/* MAIN TABLE: LEFT (Marks) + RIGHT (All Semesters) */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "60% 40%",
                gap: 1,
                mb: 2,
              }}
            >
              {/* LEFT SIDE - CURRENT SEMESTER MARKS */}
              <Box sx={{ border: "2px solid #000" }}>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    p: 0.5,
                    bgcolor: "#f0f0f0",
                    textAlign: "center",
                  }}
                >
                  Current Semester - {currentSemData.month?.toUpperCase()}{" "}
                  {currentSemData.year} (SEM {currentSemData.semester})
                </Typography>

                <Table size="small" sx={{ border: "none" }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#e0e0e0" }}>
                      {[
                        "Paper Code",
                        "Paper Name",
                        "T/P",
                        "SE",
                        "IA",
                        "Credit",
                        "Total",
                        "Per(%)",
                        "Grade",
                        "GP",
                      ].map((h, idx) => (
                        <TableCell
                          key={idx}
                          sx={{
                            border: "1px solid #000",
                            fontSize: "0.65rem",
                            p: "2px",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentSemData.marks.map((mark, idx) => {
                      const theoryTotal =
                        (mark.thObtained || 0) + (mark.iatObtained || 0);
                      const theoryMax = (mark.thMax || 0) + (mark.iatMax || 0);
                      const theoryPercentage =
                        theoryMax > 0
                          ? ((theoryTotal / theoryMax) * 100).toFixed(2)
                          : 0;

                      const practicalTotal =
                        (mark.prObtained || 0) + (mark.iapObtained || 0);
                      const practicalMax =
                        (mark.prMax || 0) + (mark.iapMax || 0);
                      const practicalPercentage =
                        practicalMax > 0
                          ? ((practicalTotal / practicalMax) * 100).toFixed(2)
                          : 0;

                      const isFailed = mark.grade === "F"; // CHECK IF FAILED

                      const getGradePoint = (perc) => {
                        if (perc >= 90) return "10";
                        if (perc >= 80) return "9";
                        if (perc >= 70) return "8";
                        if (perc >= 60) return "7";
                        if (perc >= 50) return "6";
                        if (perc >= 40) return "5";
                        if (perc >= 36) return "4";
                        return "0";
                      };

                      const getGrade = (perc) => {
                        if (perc >= 90) return "O";
                        if (perc >= 80) return "A+";
                        if (perc >= 70) return "A";
                        if (perc >= 60) return "B+";
                        if (perc >= 50) return "B";
                        if (perc >= 40) return "C";
                        if (perc >= 36) return "P";
                        return "F";
                      };

                      return (
                        <React.Fragment key={idx}>
                          {/* THEORY ROW */}
                          {mark.thMax && mark.thMax > 0 && (
                            <TableRow>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                }}
                              >
                                {mark.paperCode}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                }}
                              >
                                {mark.paperName}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                }}
                              >
                                T
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                }}
                              >
                                {mark.thObtained}/{mark.thMax}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                }}
                              >
                                {mark.iatObtained}/{mark.iatMax}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                }}
                              >
                                {mark.credit}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                }}
                              >
                                {theoryTotal}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                }}
                              >
                                {theoryPercentage}%
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  bgcolor:
                                    getGrade(theoryPercentage) === "F"
                                      ? "#ffcdd2"
                                      : "#c8e6c9",
                                }}
                              >
                                {getGrade(theoryPercentage)}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                }}
                              >
                                {getGradePoint(theoryPercentage)}
                              </TableCell>
                            </TableRow>
                          )}

                          {/* PRACTICAL ROW */}
                          {mark.prMax && mark.prMax > 0 && (
                            <TableRow>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                }}
                              >
                                {mark.paperCode}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                }}
                              >
                                {mark.paperName}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                }}
                              >
                                P
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                }}
                              >
                                {mark.prObtained}/{mark.prMax}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                }}
                              >
                                {mark.iapObtained}/{mark.iapMax}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                }}
                              >
                                {mark.credit}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                }}
                              >
                                {practicalTotal}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                }}
                              >
                                {practicalPercentage}%
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  bgcolor:
                                    getGrade(practicalPercentage) === "F"
                                      ? "#ffcdd2"
                                      : "#c8e6c9",
                                }}
                              >
                                {getGrade(practicalPercentage)}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: "1px solid #000",
                                  fontSize: "0.65rem",
                                  p: "2px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                }}
                              >
                                {getGradePoint(practicalPercentage)}
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* GRAND TOTAL ROW */}
                    <TableRow sx={{ bgcolor: "#fff9c4" }}>
                      <TableCell
                        colSpan={6}
                        sx={{
                          border: "1px solid #000",
                          fontSize: "0.7rem",
                          p: "4px",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        GRAND TOTAL:
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          fontSize: "0.7rem",
                          p: "4px",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {currentSemData.totalObtained}
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          fontSize: "0.7rem",
                          p: "4px",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {currentSemData.percentage}%
                      </TableCell>
                      <TableCell
                        colSpan={2}
                        sx={{
                          border: "1px solid #000",
                          fontSize: "0.7rem",
                          p: "4px",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        SGPA: {currentSemData.sgpa}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Failed Papers and Result */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    border: "1px solid #000",
                  }}
                >
                  <Box sx={{ borderRight: "1px solid #000", p: 0.5 }}>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: "bold" }}>
                      Failed Papers:
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        color:
                          currentSemData.failedPapers === "None"
                            ? "green"
                            : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {currentSemData.failedPapers}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 0.5 }}>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: "bold" }}>
                      Result:
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        color:
                          currentSemData.result === "Pass" ? "green" : "red",
                      }}
                    >
                      {currentSemData.result}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* RIGHT SIDE - ALL 8 SEMESTERS */}
              <Box sx={{ border: "2px solid #000" }}>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    p: 0.5,
                    bgcolor: "#f0f0f0",
                    textAlign: "center",
                  }}
                >
                  Academic Record - All 8 Semesters
                </Typography>

                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#e0e0e0" }}>
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          fontSize: "0.65rem",
                          p: "2px",
                          fontWeight: "bold",
                        }}
                      >
                        Particulars
                      </TableCell>
                      {allEightSemesters.map((sem) => (
                        <TableCell
                          key={sem}
                          sx={{
                            border: "1px solid #000",
                            fontSize: "0.65rem",
                            p: "2px",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          {sem}
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
                            fontSize: "0.65rem",
                            p: "2px",
                            fontWeight: "bold",
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
                                fontSize: "0.65rem",
                                p: "2px",
                                textAlign: "center",
                              }}
                            >
                              {semData
                                ? row.key === "monthYear"
                                  ? `${semData.month?.substring(0, 3)}/${
                                      semData.year
                                    }`
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

                    {/* CGPA ROW */}
                    <TableRow sx={{ bgcolor: "#e8f5e9" }}>
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          fontSize: "0.7rem",
                          p: "4px",
                          fontWeight: "bold",
                        }}
                      >
                        CGPA
                      </TableCell>
                      <TableCell
                        colSpan={8}
                        sx={{
                          border: "1px solid #000",
                          fontSize: "0.8rem",
                          p: "4px",
                          fontWeight: "bold",
                          textAlign: "center",
                          color: "#1b5e20",
                        }}
                      >
                        {summaryData?.cgpa}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* FOOTER - SIGNATURES */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 2,
                mt: 4,
                pt: 2,
                borderTop: "2px solid #000",
              }}
            >
              {[
                "Tabulator-1",
                "Tabulator-2",
                "Chief Tabulator",
                "Principal",
              ].map((sig, idx) => (
                <Box key={idx} sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{ fontSize: "0.75rem", fontWeight: "bold", mt: 3 }}
                  >
                    {sig}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ textAlign: "right", mt: 1 }}>
              <Typography sx={{ fontSize: "0.7rem", fontStyle: "italic" }}>
                Generated: {new Date().toLocaleDateString("en-IN")}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 5mm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </Box>
  );
}

export default TabulationRegisterPage;
