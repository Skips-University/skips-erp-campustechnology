import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  TextField,
  Paper,
  Snackbar,
  Alert,
  Rating,
  Grid,
  Chip,
} from "@mui/material";
import { Star, StarBorder, Person, Email } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import ep1 from "../api/ep1";

export default function FeedbackFillResponse() {
  const { feedbackId } = useParams();

  const [feedback, setFeedback] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // User details (NOT auto-filled since users are not logged in)
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    programname: "",
    regno: "",
    department: ""
  });

  useEffect(() => {
    fetchFeedback();
  }, [feedbackId]);

  const fetchFeedback = async () => {
    try {
      const res = await ep1.get("/api/v2/getsinglefeedbackds", {
        params: { feedbackId },
      });
      setFeedback(res.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error loading feedback form",
        severity: "error",
      });
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const handleUserDetailsChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Validation for user details
    if (!userDetails.name.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter your name",
        severity: "error",
      });
      return;
    }

    if (!userDetails.email.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter your email",
        severity: "error",
      });
      return;
    }

    if (!validateEmail(userDetails.email)) {
      setSnackbar({
        open: true,
        message: "Please enter a valid email address",
        severity: "error",
      });
      return;
    }

    // Validation for required questions
    const missingRequired = feedback.questions.filter(
      (q) => q.isrequired && !responses[q._id]
    );

    if (missingRequired.length > 0) {
      setSnackbar({
        open: true,
        message: `Please answer all required questions (${missingRequired.length} missing)`,
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const responseData = {
        feedbackid: feedbackId,
        respondentname: userDetails.name.trim(),
        respondentemail: userDetails.email.trim(),
        programname: userDetails.programname.trim(),
        regno: userDetails.regno.trim(),
        department: userDetails.department.trim(),
        responses,
        colid: feedback.colid, // Get colid from the feedback table
      };

      await ep1.post("/api/v2/createfeedbackresponseds", responseData);

      setSnackbar({
        open: true,
        message: "Thank you! Your feedback has been submitted successfully.",
        severity: "success",
      });

      // Clear form after successful submission
      setUserDetails({ name: "", email: "" });
      setResponses({});
    } catch (error) {
      console.error(error)
      setSnackbar({
        open: true,
        message: "Error submitting feedback. Please try again.",
        severity: "error",
      });
    }
    setLoading(false);
  };

  if (!feedback)
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card elevation={4} sx={{ borderRadius: 3, textAlign: "center", p: 4 }}>
          <Typography variant="h6">Loading feedback form...</Typography>
        </Card>
      </Container>
    );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header */}
          <Box
            sx={{
              p: 4,
              backgroundColor: "primary.main",
              color: "white",
              borderRadius: "12px 12px 0 0",
              textAlign: "center",
            }}
          >
            <Typography variant="h4" fontWeight={600} gutterBottom>
              📝 {feedback.title}
            </Typography>
            {feedback.description && (
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {feedback.description}
              </Typography>
            )}
          </Box>

          <Box sx={{ p: 4 }}>
            {/* User Details Section */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                backgroundColor: "#fff3e0",
                border: "2px solid #ff9800",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                mb={2}
                color="primary.main"
              >
                👤 Your Information (Required)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Your Full Name"
                    name="name"
                    value={userDetails.name}
                    onChange={handleUserDetailsChange}
                    fullWidth
                    required
                    placeholder="Enter your full name"
                    InputProps={{
                      startAdornment: (
                        <Person sx={{ mr: 1, color: "action.active" }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "white",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Your Email Address"
                    name="email"
                    type="email"
                    value={userDetails.email}
                    onChange={handleUserDetailsChange}
                    fullWidth
                    required
                    placeholder="Enter your email address"
                    InputProps={{
                      startAdornment: (
                        <Email sx={{ mr: 1, color: "action.active" }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "white",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
              <TextField
                name="programname"
                label="Program Name"
                value={userDetails.programname}
                onChange={handleUserDetailsChange}
                fullWidth
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="regno"
                label="Registration Number"
                value={userDetails.regno}
                onChange={handleUserDetailsChange}
                fullWidth
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="department"
                label="Department"
                value={userDetails.department}
                onChange={handleUserDetailsChange}
                fullWidth
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}
              />
            </Grid>
              </Grid>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                ℹ️ Your information will be kept confidential and used only for
                feedback purposes.
              </Typography>
            </Paper>

            {/* Questions Section */}
            <Typography
              variant="h6"
              fontWeight={600}
              mb={3}
              color="primary.main"
            >
              📋 Feedback Questions
            </Typography>

            {feedback.questions.map((question, index) => (
              <Paper
                key={question._id}
                elevation={1}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: "#f8f9fa",
                  border:
                    question.isrequired && !responses[question._id]
                      ? "2px solid #ff5722"
                      : "1px solid #e0e0e0",
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    {index + 1}. {question.questiontext}
                  </Typography>
                  {question.isrequired && (
                    <Chip
                      label="Required"
                      size="small"
                      color="error"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  )}
                </Box>

                {question.questiontype === "text" && (
                  <TextField
                    fullWidth
                    placeholder="Enter your answer..."
                    value={responses[question._id] || ""}
                    onChange={(e) =>
                      handleResponseChange(question._id, e.target.value)
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "white",
                      },
                    }}
                  />
                )}

                {question.questiontype === "textarea" && (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Enter your detailed answer..."
                    value={responses[question._id] || ""}
                    onChange={(e) =>
                      handleResponseChange(question._id, e.target.value)
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "white",
                      },
                    }}
                  />
                )}

                {question.questiontype === "rating" && (
                  <Box>
                    <Rating
                      name={`rating-${question._id}`}
                      value={parseInt(responses[question._id]) || 0}
                      onChange={(event, newValue) => {
                        handleResponseChange(question._id, newValue);
                      }}
                      icon={<Star fontSize="inherit" />}
                      emptyIcon={<StarBorder fontSize="inherit" />}
                      size="large"
                      sx={{
                        fontSize: "2.5rem",
                        "& .MuiRating-icon": {
                          mx: 0.5,
                        },
                      }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        1 = Poor
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        5 = Excellent
                      </Typography>
                    </Box>
                    {responses[question._id] && (
                      <Typography
                        variant="body2"
                        color="primary"
                        mt={1}
                        fontWeight={600}
                      >
                        ⭐ You rated: {responses[question._id]} star
                        {responses[question._id] > 1 ? "s" : ""}
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            ))}

            <Box textAlign="center" mt={4}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  borderRadius: 3,
                  px: 6,
                  py: 2,
                  fontWeight: 600,
                  fontSize: "1.2rem",
                  minWidth: 200,
                }}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </Button>

              <Typography
                variant="caption"
                display="block"
                mt={2}
                color="text.secondary"
              >
                📧 You will receive a confirmation email after submission
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
