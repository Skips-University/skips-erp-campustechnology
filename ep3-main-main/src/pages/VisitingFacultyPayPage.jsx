import React, { useEffect, useMemo, useState } from "react";
import { Alert, Autocomplete, Box, Button, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

export default function VisitingFacultyPayPage() {
  const [facultyRows, setFacultyRows] = useState([]);
  const [faculty, setFaculty] = useState(null);
  const [fromdate, setFromdate] = useState("");
  const [todate, setTodate] = useState("");
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    const res = await ep1.get("/api/v2/visitingfaculty/faculty", { params: { colid: global1.colid } });
    setFacultyRows(res.data?.data || []);
  };

  const calculatePay = async () => {
    if (!faculty?._id || !fromdate || !todate) {
      setError("Select faculty and date range.");
      return;
    }
    try {
      setError("");
      const res = await ep1.get("/api/v2/visitingfaculty/payable", {
        params: { colid: global1.colid, facultyid: faculty._id, fromdate, todate }
      });
      setClasses(res.data?.classes || []);
      setSummary(res.data?.summary || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to calculate payable amount.");
    }
  };

  const columns = useMemo(() => [
    { field: "classdate", headerName: "Date", width: 140 },
    { field: "facultyname", headerName: "Faculty", minWidth: 180, flex: 1 },
    { field: "department", headerName: "Department", minWidth: 160, flex: 1 },
    { field: "numberofclasses", headerName: "Classes", width: 120, type: "number" }
  ], []);

  return (
    <MenuPageShell title="Visiting Faculty Pay">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={900}>Visiting Faculty Pay</Typography>
          <Typography color="text.secondary">Calculate payable amount from class assignments and faculty pay mode.</Typography>
        </Paper>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Autocomplete
                options={facultyRows}
                value={faculty}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                getOptionLabel={(option) => option?.name ? `${option.name} - ${option.department || ""} - ${option.paymode || ""}` : ""}
                onChange={(event, value) => setFaculty(value)}
                renderInput={(params) => <TextField {...params} label="Faculty" />}
              />
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="From Date" InputLabelProps={{ shrink: true }} value={fromdate} onChange={(e) => setFromdate(e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="To Date" InputLabelProps={{ shrink: true }} value={todate} onChange={(e) => setTodate(e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={calculatePay} sx={{ height: 56 }}>Calculate</Button></Grid>
          </Grid>
        </Paper>

        {summary && (
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Payable Summary</Typography>
            <Grid container spacing={2}>
              {[
                ["Faculty", faculty?.name || ""],
                ["Department", faculty?.department || ""],
                ["Pay Mode", summary.paymode],
                ["Total Days", summary.totalDays],
                ["Total Classes", summary.totalClasses],
                ["Rate", summary.rate],
                ["Gross Amount", summary.gross],
                ["TDS %", summary.tdsPercent],
                ["TDS Amount", summary.tdsAmount],
                ["Net Payable", summary.netPayable]
              ].map(([label, value]) => (
                <Grid item xs={12} md={2.4} key={label}>
                  <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 1, p: 1.5, bgcolor: "#fff" }}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography fontWeight={800}>{typeof value === "number" ? value.toFixed(2).replace(".00", "") : value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Box sx={{ height: 520 }}><DataGrid rows={classes} getRowId={(row) => row._id} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} disableRowSelectionOnClick /></Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
