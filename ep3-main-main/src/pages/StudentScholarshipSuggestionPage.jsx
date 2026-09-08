import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";
import { AutoAwesome, Refresh, School } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const money = (value) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }) : value;
};

const checkText = (checks = [], passed = true) => checks
  .filter((item) => Boolean(item.passed) === passed)
  .map((item) => item.label)
  .join(", ");

export default function StudentScholarshipSuggestionPage() {
  const [marksSource, setMarksSource] = useState("original");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const loadSuggestions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/scholarshipds/suggestions", {
        params: {
          colid: global1.colid,
          regno: global1.regno,
          email: global1.user || global1.email,
          marksSource
        }
      });
      setData(res.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load scholarship suggestions");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => (data?.all || []).map((item, index) => ({
    id: item._id || index,
    scholarshipname: item.scholarshipname,
    amount: item.amount,
    status: item.eligible ? "Suggested" : "Partial match",
    matchscore: item.matchscore || 0,
    category: item.category || "Any",
    program: item.program || "Any",
    programcode: item.programcode || "Any",
    applicationtype: item.applicationtype || "Internal",
    applicationwebsite: item.applicationwebsite || "",
    gender: item.gender || "Any",
    cgpa: item.cgpa || "",
    matched: checkText(item.checks, true),
    missing: checkText(item.checks, false)
  })), [data]);

  const columns = [
    { field: "scholarshipname", headerName: "Scholarship", flex: 1.4, minWidth: 220 },
    { field: "amount", headerName: "Amount", width: 130, valueFormatter: ({ value }) => money(value) },
    { field: "status", headerName: "Status", width: 140 },
    { field: "matchscore", headerName: "Match %", width: 110 },
    { field: "category", headerName: "Category", width: 130 },
    { field: "programcode", headerName: "Program code", width: 140 },
    { field: "program", headerName: "Program", flex: 1, minWidth: 160 },
    {
      field: "application",
      headerName: "Application",
      width: 180,
      sortable: false,
      renderCell: (params) => (
        params.row.applicationtype === "External" && params.row.applicationwebsite
          ? <Link href={params.row.applicationwebsite} target="_blank" rel="noreferrer">Application website</Link>
          : <Typography variant="body2">Internal</Typography>
      )
    },
    { field: "gender", headerName: "Gender", width: 110 },
    { field: "cgpa", headerName: "Min CGPA/%", width: 130 },
    { field: "matched", headerName: "Matched criteria", flex: 1.4, minWidth: 220 },
    { field: "missing", headerName: "Needs review", flex: 1.2, minWidth: 200 }
  ];

  const student = data?.student || {};
  const application = data?.application || {};
  const marks = data?.marks || {};
  const suggestedAmount = (data?.suggestions || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <MenuPageShell title="Scholarship Suggestion" menuType="student">
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/studentdashboard" underline="hover">Dashboard</Link>
          <Typography color="text.primary">Scholarship</Typography>
          <Typography color="text.primary">Scholarship suggestion</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Scholarship Planner</Typography>
              <Typography variant="body2" color="text.secondary">
                Suggestions are calculated from your student profile, dynamic admission application, category, program, and selected marks source.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Marks source</InputLabel>
                <Select value={marksSource} label="Marks source" onChange={(e) => setMarksSource(e.target.value)}>
                  <MenuItem value="original">Original marks</MenuItem>
                  <MenuItem value="marks2">Marks2</MenuItem>
                  <MenuItem value="both">Original marks + Marks2</MenuItem>
                </Select>
              </FormControl>
              <Button startIcon={<Refresh />} variant="contained" onClick={loadSuggestions} disabled={loading}>
                {loading ? "Loading..." : "Load Suggestions"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%", borderLeft: "5px solid #1976d2" }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Student</Typography>
                <Typography variant="h6">{student.name || global1.name}</Typography>
                <Typography variant="body2">{student.regno || global1.regno}</Typography>
                <Typography variant="body2">{student.programcode || "-"} | {student.category || application.category || "-"}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%", borderLeft: "5px solid #2e7d32" }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Suggested Scholarships</Typography>
                <Typography variant="h4">{data?.suggestions?.length || 0}</Typography>
                <Typography variant="body2">{money(suggestedAmount)} possible value</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%", borderLeft: "5px solid #ed6c02" }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Best Academic Score</Typography>
                <Typography variant="h4">{marks.bestPercentage ? `${Number(marks.bestPercentage).toFixed(1)}%` : "-"}</Typography>
                <Typography variant="body2">Best CGPA: {marks.bestCgpa ? Number(marks.bestCgpa).toFixed(2) : "-"}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%", borderLeft: "5px solid #7b1fa2" }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Data Sources</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip size="small" icon={<School />} label={application?._id ? "Admission form" : "No admission form"} color={application?._id ? "success" : "default"} />
                  <Chip size="small" label={`Original: ${marks.original?.count || 0}`} />
                  <Chip size="small" label={`Marks2: ${marks.marks2?.count || 0}`} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Academic Details Used</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">User Model</Typography>
              <Typography variant="body2">Program: {student.program || "-"} ({student.programcode || "-"})</Typography>
              <Typography variant="body2">Academic year: {student.academicyear || "-"} | Semester: {student.semester || "-"}</Typography>
              <Typography variant="body2">Category: {student.category || "-"} | Gender: {student.gender || "-"}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Dynamic Admission Application</Typography>
              <Typography variant="body2">Application: {application.applicationid || application.applicationnumber || "-"}</Typography>
              <Typography variant="body2">Program: {application.programapplied || "-"} ({application.programcode || "-"})</Typography>
              <Typography variant="body2">10th: {application.marks_10 || application.cgpa_10 || "-"} | 12th: {application.marks_12 || application.cgpa_12 || "-"}</Typography>
              <Typography variant="body2">UG: {application.marks_UG || application.cgpa_UG || "-"} | PG: {application.marks_PG || application.cgpa_PG || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <AutoAwesome color="primary" />
            <Typography variant="h6">Scholarship Suggestions</Typography>
          </Stack>
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            getRowClassName={(params) => params.row.status === "Suggested" ? "suggested-row" : ""}
            sx={{
              "& .suggested-row": { bgcolor: "rgba(46, 125, 50, 0.08)" },
              "& .MuiDataGrid-cell": { whiteSpace: "normal", lineHeight: 1.4, py: 1 }
            }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
