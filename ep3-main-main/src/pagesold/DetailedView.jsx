import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Snackbar,
  Alert,
  Container,
  Paper,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Delete, CheckCircle } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function DetailedView() {
  const { id } = useParams();
  const colid = Number(global1.colid);
  const navigate = useNavigate();
  const [rubric, setRubric] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const isExamRole = global1.role === "Exam";

  useEffect(() => {
    ep1
      .get(`/api/v2/getsinglerubrics?id=${id}&colid=${colid}`)
      .then((res) => setRubric(res.data[0]))
      .catch((err) => {
        console.error(err);
        setSnackbarMsg("Error loading rubric data");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      });
  }, [id, colid]);

  const handleDelete = () => {
    ep1
      .get(`/api/v2/deleterubrics?id=${id}`) // Fixed endpoint name
      .then(() => {
        setSnackbarMsg("Rubric deleted successfully");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        setTimeout(() => navigate(-1), 1500); // Go back to previous page
      })
      .catch(() => {
        setSnackbarMsg("Delete failed");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      });
  };

  const handleFinalizeExam = async () => {
    try {
      setLoading(true);
      const { regno, coursecode, examcode, colid, exam, studentname, program, programcode, year, semester, course } = rubric;

      // Step 1: Calculate results
      const resultResponse = await ep1.get("/api/v2/calculaterubricresult", {
        params: { regno, coursecode, examcode, colid }
      });
      const result = resultResponse.data[0];

      // Step 2: Create finalized record
      const finalizedRecord = {
        name: global1.name,
        user: "NA",
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
        comments: ""
      };

      // Step 3: Submit to finalize
      const createResponse = await ep1.post("/api/v2/createexammarks", finalizedRecord);
      
      if ([200, 201].includes(createResponse.status)) {
        setSnackbarMsg("Exam finalized successfully!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        setTimeout(() => navigate("/finalize"), 2000);
      } else {
        throw new Error("Finalization failed");
      }
    } catch (error) {
      setSnackbarMsg("Error during finalization: " + (error.response?.data?.message || error.message));
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  if (!rubric) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  const renderMarks = (title, data, fullKey, obtainKey, nameKey, color = "primary") => (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={2} color={`${color}.main`}>
        {title}
      </Typography>
      {data && data.length > 0 ? (
        data.map((entry, idx) => (
          <Card 
            key={idx} 
            variant="outlined" 
            sx={{ 
              mb: 2, 
              backgroundColor: "#f8f9fa",
              border: `1px solid ${color === 'primary' ? '#e3f2fd' : '#fff3e0'}`
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1" fontWeight={600}>
                    {entry[nameKey]}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Chip 
                    label={`Full: ${entry[fullKey]}`} 
                    variant="outlined" 
                    size="small"
                    color="default"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Chip 
                    label={`Obtained: ${entry[obtainKey]}`} 
                    color={color}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          No {title.toLowerCase()} recorded
        </Typography>
      )}
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">
          Rubric Details
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {/* Student Information */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Student Information
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {rubric.studentname}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Reg No: {rubric.regno}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Program Information
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {rubric.program}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Code: {rubric.programcode}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, backgroundColor: "#e8f5e8", borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Course Information
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {rubric.course} ({rubric.coursecode})
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, backgroundColor: "#e8f5e8", borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Exam Information
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {rubric.exam} ({rubric.examcode})
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              <strong>Year:</strong> {rubric.year}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              <strong>Semester:</strong> {rubric.semester}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              <strong>External Full:</strong> {rubric.externalfull}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              <strong>External Marks:</strong> {rubric.externalmarks}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Marks Sections */}
      {renderMarks(
        "Internal Assessment Marks",
        rubric.internalmarks || [],
        "internalfull",
        "internalobtainmark",
        "internalexamname",
        "primary"
      )}
      
      {renderMarks(
        "Attendance Marks",
        rubric.attendancemarks || [],
        "attendancefull",
        "attendanceobtainmark",
        "attendancename",
        "secondary"
      )}
      
      {renderMarks(
        "Internship Marks",
        rubric.internshipmarks || [],
        "internshipfull",
        "internshipobtainmark",
        "internshipname",
        "success"
      )}
      
      {renderMarks(
        "Extra-curricular Marks",
        rubric.extracurriculummarks || [],
        "extracurriculumfull",
        "extracurriculumobtainmark",
        "extracurriculumname",
        "warning"
      )}

      {/* Action Buttons */}
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Box display="flex" gap={2} justifyContent="flex-end" flexWrap="wrap">
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            sx={{ px: 3, py: 1 }}
          >
            Delete Rubric
          </Button>
          
          {/* Final Exam button - only for Exam role */}
          {isExamRole && (
            <Button
              variant="contained"
              color="success"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
              onClick={handleFinalizeExam}
              disabled={loading}
              sx={{ px: 3, py: 1, fontWeight: 600 }}
            >
              {loading ? "Finalizing..." : "Finalize Exam"}
            </Button>
          )}
          
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ px: 3, py: 1 }}
          >
            Go Back
          </Button>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
