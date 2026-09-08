import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Container, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function BosReportPage() {
  const [options, setOptions] = useState({ cycles: [], programs: [] });
  const [filter, setFilter] = useState({ cycleid: "", academicyear: "", program: "", programcode: "" });
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const selectedCycle = useMemo(() => options.cycles.find((c) => c._id === filter.cycleid), [options.cycles, filter.cycleid]);

  const loadOptions = async (params = {}) => {
    const res = await ep1.get("/api/v2/bos/options", { params: { colid: global1.colid, ...params } });
    setOptions(res.data || { cycles: [], programs: [] });
  };
  useEffect(() => { loadOptions(); }, []);
  useEffect(() => { if (filter.academicyear) loadOptions({ academicyear: filter.academicyear }); }, [filter.academicyear]);

  const selectCycle = (cycleid) => {
    const cycle = options.cycles.find((c) => c._id === cycleid);
    setFilter((p) => ({ ...p, cycleid, academicyear: cycle?.academicyear || p.academicyear }));
  };
  const selectProgram = (programcode) => {
    const program = options.programs.find((p) => p.programcode === programcode);
    setFilter((p) => ({ ...p, programcode, program: program?.program || "" }));
  };
  const loadReport = async () => {
    try {
      const res = await ep1.get("/api/v2/bos/report", { params: { colid: global1.colid, ...filter } });
      setReport(res.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load BoS report");
    }
  };
  const printReport = () => window.print();

  return (
    <MenuPageShell title="BoS Report">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField select fullWidth label="BoS Cycle" value={filter.cycleid} onChange={(e) => selectCycle(e.target.value)}>{options.cycles.map((c) => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Academic Year" value={filter.academicyear} onChange={(e) => setFilter((p) => ({ ...p, academicyear: e.target.value }))} /></Grid>
            <Grid item xs={12} md={4}><TextField select fullWidth label="Program" value={filter.programcode} onChange={(e) => selectProgram(e.target.value)}>{options.programs.map((p) => <MenuItem key={p.programcode} value={p.programcode}>{p.programcode} - {p.program}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><Stack direction="row" spacing={1}><Button variant="contained" onClick={loadReport}>Load</Button><Button variant="outlined" onClick={printReport}>Print</Button></Stack></Grid>
          </Grid>
        </Paper>
        {report && (
          <Paper id="bos-print" sx={{ p: 3, bgcolor: "white", "@media print": { boxShadow: "none", p: 1 } }}>
            <style>{`@media print {.MuiDrawer-root,.MuiAppBar-root,.no-print{display:none!important;} main{height:auto!important;overflow:visible!important;background:white!important;} #bos-print{width:190mm;margin:0 auto;font-size:11px;} @page{size:A4;margin:10mm;}}`}</style>
            <Stack alignItems="center" spacing={0.5} sx={{ mb: 2, textAlign: "center" }}>
              {report.institution?.logolink && <Box component="img" src={report.institution.logolink} alt="logo" sx={{ height: 64, objectFit: "contain" }} />}
              <Typography variant="h6" fontWeight={900}>{report.institution?.institutionname || global1.insname || "Institution"}</Typography>
              <Typography variant="body2">{report.institution?.address || ""}</Typography>
              <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>Board of Studies Report</Typography>
              <Typography variant="body2">{selectedCycle?.title || ""} | {filter.academicyear} | {filter.programcode} {filter.program}</Typography>
            </Stack>
            <Typography variant="h6" fontWeight={800}>Program Structure</Typography>
            {report.programReviews?.length ? report.programReviews.map((item) => (
              <Box key={item._id} sx={{ my: 1.5 }}>
                <Typography fontWeight={800}>{item.program} ({item.programcode})</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={6}><Typography variant="subtitle2">Suggested Structure</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{item.suggestedstructure}</Typography></Grid>
                  <Grid item xs={12} md={6}><Typography variant="subtitle2">Semester-wise Courses</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{item.semesterwisecourses}</Typography></Grid>
                  <Grid item xs={12} md={6}><Typography variant="subtitle2">Inclusions</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{item.inclusions}</Typography></Grid>
                  <Grid item xs={12} md={6}><Typography variant="subtitle2">Deletions</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{item.deletions}</Typography></Grid>
                </Grid>
              </Box>
            )) : <Typography>No program review saved.</Typography>}
            <Typography variant="h6" fontWeight={800} sx={{ mt: 2 }}>Course Reviews</Typography>
            {report.courseReviews?.map((item) => (
              <Box key={item._id} sx={{ borderTop: "1px solid #ddd", pt: 1.5, mt: 1.5, breakInside: "avoid" }}>
                <Typography fontWeight={900}>Semester {item.semester}: {item.course} ({item.coursecode})</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={6}><Typography variant="subtitle2">Old Syllabus</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{item.oldsyllabus}</Typography></Grid>
                  <Grid item xs={12} md={6}><Typography variant="subtitle2">New Syllabus</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{item.newsyllabus}</Typography></Grid>
                  <Grid item xs={12}><Typography variant="subtitle2">Suggested Assessment</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{item.assessmentscheme}</Typography></Grid>
                </Grid>
              </Box>
            ))}
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
              <Typography>Prepared by</Typography>
              <Typography>Checked by</Typography>
              <Typography>Approved by</Typography>
            </Stack>
          </Paper>
        )}
      </Container>
    </MenuPageShell>
  );
}
