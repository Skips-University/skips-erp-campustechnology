import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { ArrowBack, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export default function NepLmsStudentRemedialPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/remedial", { params: { colid: global1.colid, regno: global1.regno, status: "Active" } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load remedial content");
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => ({
    total: rows.length,
    courses: uniqueSorted(rows.map((row) => row.coursecode || row.course)).length,
    videos: rows.filter((row) => row.contenttype === "Video").length,
    materials: rows.filter((row) => row.contenttype === "Course Material").length
  }), [rows]);

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "course", headerName: "Course", width: 190 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "topic", headerName: "Topic", minWidth: 220, flex: 1 },
    { field: "contenttype", headerName: "Type", width: 150 },
    { field: "percentage", headerName: "Assessment Score %", width: 160 },
    {
      field: "link",
      headerName: "Open",
      width: 140,
      renderCell: (params) => params.value ? <a href={params.value} target="_blank" rel="noreferrer">Open Link</a> : ""
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>My Remedial Content</Typography>
          <Typography variant="body2" color="text.secondary">{global1.name || "Student"} | {global1.regno}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashmclassenr1stud" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
        </Stack>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: "Total Items", value: summary.total },
          { label: "Courses", value: summary.courses },
          { label: "Videos", value: summary.videos },
          { label: "Course Material", value: summary.materials }
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                <Typography variant="h5" fontWeight={900}>{item.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {rows.slice(0, 6).map((row) => (
          <Grid item xs={12} md={6} lg={4} key={row._id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap", rowGap: 1 }}>
                  <Chip size="small" color={row.contenttype === "Video" ? "primary" : "secondary"} label={row.contenttype || "Remedial"} />
                  <Chip size="small" variant="outlined" label={`${row.percentage || 0}%`} />
                </Stack>
                <Typography variant="subtitle1" fontWeight={800}>{row.topic || row.title || "Remedial Content"}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{row.course} ({row.coursecode})</Typography>
                {row.link && <Button href={row.link} target="_blank" rel="noreferrer" variant="contained" size="small">Open</Button>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "my_remedial_content" } } }}
          sx={{ minWidth: 1150 }}
        />
      </Paper>
    </Container>
  );
}
