import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function DetailedView() {
  const { id } = useParams();
  const colid = Number(global1.colid);
  const navigate = useNavigate();
  const [rubric, setRubric] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  useEffect(() => {
    ep1
      .get(`/api/v2/getsinglerubrics?id=${id}&colid=${colid}`)
      .then((res) => setRubric(res.data[0]))
      .catch((err) => console.error(err));
  }, [id]);

  const handleDelete = () => {
    ep1
      .get(`/api/v2/deleterubric?id=${id}`)
      .then(() => {
        setSnackbarMsg("Rubric deleted successfully");
        setOpenSnackbar(true);
        setTimeout(() => navigate("/rubrics"), 1500);
      })
      .catch(() => {
        setSnackbarMsg("Delete failed");
        setOpenSnackbar(true);
      });
  };

  if (!rubric) return <Typography>Loading...</Typography>;

  const renderMarks = (title, data, fullKey, obtainKey, nameKey) => (
    <Box mb={2}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {data.map((entry, idx) => (
        <Card key={idx} variant="outlined" sx={{ mb: 1 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <strong>{entry[nameKey]}</strong>
              </Grid>
              <Grid item xs={4}>
                Full Marks: {entry[fullKey]}
              </Grid>
              <Grid item xs={4}>
                Obtained: {entry[obtainKey]}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Rubric Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <strong>Student:</strong> {rubric.studentname} ({rubric.regno})
        </Grid>
        <Grid item xs={6}>
          <strong>Program:</strong> {rubric.program} ({rubric.programcode})
        </Grid>
        <Grid item xs={6}>
          <strong>Course:</strong> {rubric.course} ({rubric.coursecode})
        </Grid>
        <Grid item xs={6}>
          <strong>Exam:</strong> {rubric.exam} ({rubric.examcode})
        </Grid>
        <Grid item xs={6}>
          <strong>Year:</strong> {rubric.year}
        </Grid>
        <Grid item xs={6}>
          <strong>Semester:</strong> {rubric.semester}
        </Grid>
        <Grid item xs={6}>
          <strong>External Full:</strong> {rubric.externalfull}
        </Grid>
        <Grid item xs={6}>
          <strong>External Marks:</strong> {rubric.externalmarks}
        </Grid>
      </Grid>

      {renderMarks(
        "Internal Marks",
        rubric.internalmarks,
        "internalfull",
        "internalobtainmark",
        "internalexamname"
      )}
      {renderMarks(
        "Attendance Marks",
        rubric.attendancemarks,
        "attendancefull",
        "attendanceobtainmark",
        "attendancename"
      )}
      {renderMarks(
        "Internship Marks",
        rubric.internshipmarks,
        "internshipfull",
        "internshipobtainmark",
        "internshipname"
      )}
      {renderMarks(
        "Extra-curricular Marks",
        rubric.extracurriculummarks,
        "extracurriculumfull",
        "extracurriculumobtainmark",
        "extracurriculumname"
      )}

      <Box mt={3}>
        <Button
          variant="outlined"
          color="error"
          sx={{ ml: 2 }}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="info" variant="filled">
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
