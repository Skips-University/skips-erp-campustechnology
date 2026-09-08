import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Container,
  Typography,
  Snackbar,
  Alert,
  Grid,
  TextField,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { label: "Program Code", name: "programcode" },
  { label: "Course Code", name: "coursecode" },
  { label: "Exam Code", name: "examcode" },
  { label: "Year", name: "year" },
  { label: "Semester", name: "semester" },
];

export default function FinalizeData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false); // table loading
  const [bulkLoading, setBulkLoading] = useState(false); // bulk button loading
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 }); // progress count
  const [filters, setFilters] = useState({
    programcode: "",
    coursecode: "",
    examcode: "",
    year: "",
    semester: "",
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();

  const handleSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await ep1.get("/api/v2/getallrubrics", {
        params: { ...filters, colid: global1.colid },
      });
      setRows(Array.isArray(response.data) ? response.data : []);
      if (!Array.isArray(response.data)) {
        handleSnackbar("Unexpected server response", "error");
      }
    } catch {
      handleSnackbar("Error fetching data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    fetchData();
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFinalizeButton = async (row) => {
    try {
      setLoading(true);
      const {
        regno,
        coursecode,
        examcode,
        colid,
        exam,
        studentname,
        program,
        programcode,
        year,
        semester,
        course,
      } = row;

      const resultResponse = await ep1.get("/api/v2/calculaterubricresult", {
        params: { regno, coursecode, examcode, colid },
      });
      const result = resultResponse.data[0];

      const finalizedRecord = {
        name: global1.name,
        user: global1.user,
        student: studentname,
        exam,
        program,
        programcode: programcode || "",
        semester,
        academicyear: year,
        course,
        regno,
        coursecode,
        examcode,
        colid: parseInt(global1.colid),
        iafull: result?.iafull || 0,
        iamarks: result?.iamarks || 0,
        eafull: result?.eafull || 0,
        eamarks: result?.eamarks || 0,
        totalfull: result?.totalfull || 0,
        totalmarks: result?.totalmarks || 0,
        totalp: result?.totalp || result?.percentage || 0,
        egrade: result?.egrade || "F",
        status1: "Finalized",
        comments: "",
      };

      const createResponse = await ep1.post("/api/v2/createexammarks", finalizedRecord);
      if ([200, 201].includes(createResponse.status)) {
        handleSnackbar("Finalized successfully.", "success");
        fetchData();
      } else {
        handleSnackbar(`Finalization failed: ${createResponse.statusText}`, "error");
      }
    } catch {
      handleSnackbar("Error during finalization.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delay helper
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Bulk Final Exam with progress
  const handleBulkFinalize = async () => {
    setBulkLoading(true);
    setBulkProgress({ current: 0, total: 0 });

    try {
      // Step 1: calculate all results on server
      const calcRes = await ep1.get("/api/v2/calculatebulkrubricresults", {
        params: { ...filters, colid: global1.colid },
      });
      const results = Array.isArray(calcRes.data) ? calcRes.data : [];
      if (!results.length) {
        handleSnackbar("No data available for finalization.", "warning");
        setBulkLoading(false);
        setBulkProgress({ current: 0, total: 0 });
        return;
      }

      setBulkProgress({ current: 0, total: results.length });

      // Step 2: sequentially send createexammarks requests with delay and progress updates
      for (let i = 0; i < results.length; i++) {
        const r = results[i];

        const finalizedRecord = {
          name: global1.name,
          user: global1.user,
          student: r.student,
          exam: r.exam,
          program: r.program,
          programcode: r.programcode || "",
          semester: r.semester,
          academicyear: r.academicyear,
          course: r.course,
          regno: r.regno,
          coursecode: r.coursecode,
          examcode: r.examcode,
          colid: r.colid,
          iafull: r.iafull || 0,
          iamarks: r.iamarks || 0,
          eafull: r.eafull || 0,
          eamarks: r.eamarks || 0,
          totalfull: r.totalfull || 0,
          totalmarks: r.totalmarks || 0,
          totalp: r.totalp || 0,
          egrade: r.egrade || "F",
          status1: "Finalized",
          comments: "",
        };

        try {
          await ep1.post("/api/v2/createexammarks", finalizedRecord);
        } catch {
          // Continue with next even if one fails
        }

        setBulkProgress({ current: i + 1, total: results.length });
        await wait(300); // gentle delay between calls
      }

      handleSnackbar(`Bulk Finalized ${results.length} students`, "success");
      fetchData();
    } catch {
      handleSnackbar("Bulk finalize failed", "error");
    } finally {
      setBulkLoading(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  const columns = [
    { field: "regno", headerName: "Reg No", width: 120 },
    { field: "examcode", headerName: "Exam Code", width: 120 },
    { field: "coursecode", headerName: "Course Code", width: 120 },
    { field: "programcode", headerName: "Program Code", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 260,
      renderCell: ({ row }) => (
        <Box display="flex" gap={1}>
          <Button variant="outlined" size="small" onClick={() => handleFinalizeButton(row)}>
            Final Exam
          </Button>
          <Button variant="outlined" size="small" onClick={() => navigate(`/detail/${row._id}`)}>
            View
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          Rubric Exam Finalization
        </Typography>
        <Grid container spacing={2} alignItems="flex-end">
          {filterFields.map((field) => (
            <Grid item xs={12} sm={6} md={2} key={field.name}>
              <TextField
                label={field.label}
                name={field.name}
                value={filters[field.name]}
                onChange={handleFilterChange}
                fullWidth
                size="small"
              />
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              fullWidth
              sx={{ height: "100%" }}
              onClick={handleApplyFilter}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" justifyContent="flex-end" mb={2} alignItems="center" gap={2}>
        <Button
          color="primary"
          variant="contained"
          sx={{ px: 3, py: 1, fontWeight: 600 }}
          onClick={handleBulkFinalize}
          disabled={bulkLoading || !rows.length}
        >
          {bulkLoading && <CircularProgress size={18} sx={{ color: "white", mr: 1 }} />}
          {bulkLoading && bulkProgress.total > 0
            ? `Bulk Final Exam (${bulkProgress.current}/${bulkProgress.total})`
            : "Bulk Final Exam"}
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" my={6}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            pagination
            autoHeight
            sx={{
              "& .MuiDataGrid-row": { fontSize: "1rem" },
              "& .MuiDataGrid-columnHeader": { fontWeight: 700, fontSize: "1rem" },
            }}
          />
        )}
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
