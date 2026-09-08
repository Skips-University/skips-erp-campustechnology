import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Verified, Search } from "@mui/icons-material";
import ep1 from "../api/ep1";

export default function PublicGradeCardBlockchainVerifyPage() {
  const [student, setStudent] = useState("");
  const [regno, setRegno] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const queryLoadedRef = useRef(false);

  const verify = useCallback(async (studentOverride, regnoOverride) => {
    const selectedStudent = studentOverride ?? student;
    const selectedRegno = regnoOverride ?? regno;
    if (!selectedStudent.trim() || !selectedRegno.trim()) {
      setError("Student name and reg no are required.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setResult(null);
      const res = await ep1.get("/api/v2/public/grade-card/blockchain-verify", {
        params: { student: selectedStudent, regno: selectedRegno }
      });
      setResult(res.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to verify marksheet from blockchain.");
    } finally {
      setLoading(false);
    }
  }, [student, regno]);

  useEffect(() => {
    if (queryLoadedRef.current) return;
    queryLoadedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const queryStudent = params.get("student") || "";
    const queryRegno = params.get("regno") || "";
    if (queryStudent || queryRegno) {
      setStudent(queryStudent);
      setRegno(queryRegno);
    }
    if (queryStudent && queryRegno) {
      verify(queryStudent, queryRegno);
    }
  }, [verify]);

  const verifiedRows = result?.data || [];
  const active = verifiedRows.find((row) => row.valid) || verifiedRows[0] || null;
  const payload = active?.payload || {};
  const markRows = payload.marks || [];

  const markColumns = [
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "course", headerName: "Course", minWidth: 220, flex: 1 },
    { field: "internalmarks", headerName: "Internal", width: 110, type: "number" },
    { field: "externalmarks", headerName: "External", width: 110, type: "number" },
    { field: "total", headerName: "Total", width: 100, type: "number" },
    { field: "credits", headerName: "Credits", width: 100, type: "number" },
    { field: "grade", headerName: "Grade", width: 90 },
    { field: "gradepoint", headerName: "Grade Point", width: 120, type: "number" },
    { field: "gpa", headerName: "GPA", width: 100, type: "number" },
    { field: "passstatus", headerName: "Status", width: 110 }
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f7fb", py: { xs: 2, md: 5 } }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <Verified color="success" sx={{ fontSize: 44 }} />
            <Typography variant="h4" fontWeight={900}>Blockchain Marksheet Verification</Typography>
            <Typography color="text.secondary">Enter student name and registration number to verify stored grade card data.</Typography>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="Student Name" value={student} onChange={(e) => setStudent(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Reg No" value={regno} onChange={(e) => setRegno(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="contained" startIcon={<Search />} onClick={() => verify()} disabled={loading} sx={{ height: 56 }}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </Grid>
          </Grid>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {result && (
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={900}>{result.verified ? "Verified marksheet found" : "No verified marksheet found"}</Typography>
                <Typography color="text.secondary">{verifiedRows.length} blockchain record(s) matched the entered details.</Typography>
              </Box>
              <Chip color={result.verified ? "success" : "error"} label={result.verified ? "Blockchain Verified" : "Not Verified"} />
            </Stack>

            {active && (
              <>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  {[
                    ["Student", payload.student?.name],
                    ["Reg No", payload.student?.regno],
                    ["Program", payload.student?.program],
                    ["Program Code", payload.student?.programcode],
                    ["Semester", payload.semester],
                    ["Regulation", payload.student?.regulation],
                    ["SGPA", payload.sgpa?.value],
                    ["CGPA", payload.cgpa?.value],
                    ["Block Index", active.blockindex],
                    ["Hash", active.hash]
                  ].map(([label, value]) => (
                    <Grid item xs={12} md={label === "Hash" ? 12 : 3} key={label}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>{value || "-"}</Typography>
                    </Grid>
                  ))}
                </Grid>

                {active.errors?.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>{active.errors.join(" | ")}</Alert>
                )}

                <Box sx={{ height: 450, width: "100%" }}>
                  <DataGrid
                    rows={markRows}
                    getRowId={(row) => String(row._id || `${row.coursecode}-${row.regno}`)}
                    columns={markColumns}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "verified_blockchain_marksheet" } } }}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                  />
                </Box>
              </>
            )}
          </Paper>
        )}
      </Container>
    </Box>
  );
}
