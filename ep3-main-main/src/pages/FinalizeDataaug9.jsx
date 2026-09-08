import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Snackbar,
  Alert,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function FinalizeData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await ep1.get(`/api/v2/getallrubrics`, {
        params: {
          colid: global1.colid,
        },
      });

      if (Array.isArray(response.data)) {
        setRows(response.data);
      } else {
        console.error("Unexpected response structure:", response.data);
        handleSnackbar("Unexpected server response", "error");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      handleSnackbar("Error fetching data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

const handleFinalizeButton = async (row) => {
  try {
    setLoading(true);
    const { regno, coursecode, examcode, colid, exam, studentname, program, year, semester, course } = row;

    const resultResponse = await ep1.get(
      `/api/v2/calculaterubricresult`,
      {
        params: {
          regno,
          coursecode,
          examcode,
          colid,
        },
      }
    );
    const result = resultResponse.data[0];

    // Handle null values
    const finalizedRecord = {
      name: global1.name,
      user: global1.user,
      student: studentname,
      exam: exam,
      program: program,
      semester: semester,
      academicyear: year,
      course,
      regno,
      coursecode,
      examcode,
      colid: parseInt(global1.colid),
      iafull: result.iafull || 0,
      iamarks: result.iamarks || 0,
      eafull: result.eafull || 0,
      eamarks: result.eamarks || 0,
      totalfull: result.totalfull || 0,
      totalmarks: result.totalmarks || 0,
      percentage: result.totalp || 0,
      egrade: result.egrade || "F", // Default grade if not calculated
    };

    const createResponse = await ep1.post(
      `/api/v2/createexammarks`,
      finalizedRecord
    );

    if (createResponse.status === 200 || createResponse.status === 201) {
      handleSnackbar("Finalized successfully.", "success");
      fetchData(); // Refresh the data after finalization
    } else {
      handleSnackbar(`Finalization failed: ${createResponse.statusText}`, "error");
    }
  } catch (error) {
    let errorMessage = "Error during finalization.";
    if (error.response && error.response.data) {
      errorMessage += ` ${error.response.data.message}`;
    }
    handleSnackbar(errorMessage, "error");
  } finally {
    setLoading(false);
  }
};

  const columns = [
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "examcode", headerName: "Exam Code", width: 150 },
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "programcode", headerName: "Program Code", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      renderCell: ({ row }) => (
        <>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleFinalizeButton(row)}
          >
            Final Exam
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ ml: 1 }}
            onClick={() => navigate(`/detail/${row._id}`)}
          >
            View
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Rubric Exam Finalization
      </Typography>

      <Box sx={{ height: 550, width: "100%", mt: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            pagination
            disableSelectionOnClick
          />
        )}
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
