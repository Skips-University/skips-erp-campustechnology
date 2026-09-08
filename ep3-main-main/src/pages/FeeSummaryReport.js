import React, { useEffect, useState } from "react";
import {
  Box, Grid, Card, CardContent,
  Typography, Select, MenuItem,
  FormControl, InputLabel,
  Tabs, Tab, Button
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


export default function FeeSummaryReport() {

    const navigate = useNavigate();

  const colid = global1.colid; // Should come from login session

  const [year, setYear] = useState("");
  const [program, setProgram] = useState("");
  const [years, setYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesterSummary, setSemesterSummary] = useState([]);
  const [programSummary, setProgramSummary] = useState([]);
  const [details, setDetails] = useState([]);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    ep1.get(`/api/fees-report/years?colid=${colid}`)
      .then(res => setYears(res.data));
  }, []);

  useEffect(() => {
    if (year) {
      ep1.get(`/api/fees-report/programs?colid=${colid}&year=${year}`)
        .then(res => setPrograms(res.data));

      ep1.get(`/api/fees-report/program-summary?colid=${colid}&year=${year}`)
        .then(res => setProgramSummary(res.data));
    }
  }, [year]);

  useEffect(() => {
    if (year && program) {
      ep1.get(`/api/fees-report/semester-summary?colid=${colid}&year=${year}&program=${program}`)
        .then(res => setSemesterSummary(res.data));
    }
  }, [year, program]);

  const summaryColumns = [
    { field: "_id", headerName: "Semester / Program", flex: 1 },
    { field: "totalAmount", headerName: "Total Fees", flex: 1 },
    { field: "totalRecords", headerName: "Entries", flex: 1 }
  ];

  const detailColumns = [
    { field: "name", headerName: "Student", flex: 1 },
    { field: "feeitem", headerName: "Fee Item", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1 },
    { field: "semester", headerName: "Semester", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 }
  ];

  return (
    <Box p={4}>

        {/* Back Button */}
    <Box display="flex" alignItems="center" mb={2}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashdashfacnew')}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600
        }}
      >
        Back to Dashboard
      </Button>
    </Box>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Fee Summary Report
      </Typography>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select value={year} onChange={(e) => setYear(e.target.value)}>
                  {years.map((y, i) => (
                    <MenuItem key={i} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Program</InputLabel>
                <Select value={program} onChange={(e) => setProgram(e.target.value)}>
                  {programs.map((p, i) => (
                    <MenuItem key={i} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="Semester Wise" />
        <Tab label="Program Wise" />
      </Tabs>

      {tab === 0 && (
        <Card sx={{ mt: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Semester Summary</Typography>
            <DataGrid
              autoHeight
              rows={semesterSummary.map((r, i) => ({ id: i, ...r }))}
              columns={summaryColumns}
              onRowClick={(params) => {
                axios.get(`/api/fees-report/semester-details?colid=${colid}&year=${year}&program=${program}&semester=${params.row._id}`)
                  .then(res => setDetails(res.data));
              }}
            />
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card sx={{ mt: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Program Summary</Typography>
            <DataGrid
              autoHeight
              rows={programSummary.map((r, i) => ({ id: i, ...r }))}
              columns={summaryColumns}
              onRowClick={(params) => {
                axios.get(`/api/fees-report/program-details?colid=${colid}&year=${year}&program=${params.row._id}`)
                  .then(res => setDetails(res.data));
              }}
            />
          </CardContent>
        </Card>
      )}

      {details.length > 0 && (
        <Card sx={{ mt: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Detailed Records</Typography>
            <DataGrid
              autoHeight
              rows={details.map((r, i) => ({ id: i, ...r }))}
              columns={detailColumns}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}