import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Grid,
  Rating,
  Chip,
  Button,
  TextField,
  Divider,
  Paper,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function FeedbackInternalAnalytics1() {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [coData, setCoData] = useState(null);
  const [poData, setPoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [feedbackDetails, setFeedbackDetails] = useState(null);

  // CO/PO Report Filters
  const [coFilters, setCoFilters] = useState({
    programcode: "",
    coursecode: "",
    year: "",
  });
  const [poFilters, setPoFilters] = useState({
    programcode: "",
    year: "",
  });

  useEffect(() => {
    fetchAnalytics();
    fetchFeedbackDetails();
  }, [feedbackId]);

  useEffect(() => {
    if (feedbackDetails) {
      setCoFilters((prev) => ({
        ...prev,
        programcode: feedbackDetails.programcode || "",
        coursecode: feedbackDetails.coursecode || "",
        year: feedbackDetails.year || "",
      }));
      setPoFilters((prev) => ({
        ...prev,
        programcode: feedbackDetails.programcode || "",
        year: feedbackDetails.year || "",
      }));
    }
  }, [feedbackDetails]);

  const fetchAnalytics = async () => {
    try {
      const res = await ep1.get("/api/v2/getfeedbackinternalanalyticsds1", {
        params: { feedbackId, colid: global1.colid },
      });
      setAnalytics(res.data);
    } catch (error) {
    }
    setLoading(false);
  };

  const fetchFeedbackDetails = async () => {
    try {
      const res = await ep1.get("/api/v2/getsinglefeedbackinternalds1", {
        params: { feedbackId, colid: global1.colid },
      });
      setFeedbackDetails(res.data);
    } catch (error) {
    }
  };

  const fetchCOReport = async () => {
    if (!coFilters.programcode || !coFilters.year || !coFilters.coursecode) {
      alert("Please fill all CO filter fields");
      return;
    }

    try {
      const res = await ep1.get("/api/v2/getcorepositoryds1", {
        params: {
          colid: global1.colid,
          ...coFilters,
        },
      });
      setCoData(res.data);
    } catch (error) {
    }
  };

  const fetchPOReport = async () => {
    if (!poFilters.programcode || !poFilters.year) {
      alert("Please fill all PO filter fields");
      return;
    }

    try {
      const res = await ep1.get("/api/v2/getporepositoryds1", {
        params: {
          colid: global1.colid,
          ...poFilters,
        },
      });
      setPoData(res.data);
    } catch (error) {
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (loading || !analytics) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading analytics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 3,
              backgroundColor: "primary.main",
              color: "white",
              borderRadius: "12px 12px 0 0",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              color="inherit"
              onClick={() => navigate("/feedbackinternalmanagement1")}
              startIcon={<ArrowBack />}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h5" fontWeight={600}>
              📊 Feedback Analytics Dashboard
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ px: 3 }}
            >
              <Tab label="📋 Question Analytics" />
              <Tab label="🎯 CO Reports" />
              <Tab label="🏆 PO Reports" />
            </Tabs>
          </Box>

          {/* Tab 1: Question Analytics */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              📋 {analytics.feedbackTitle} - Question Analysis
            </Typography>

            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={4}>
                <Card
                  elevation={2}
                  sx={{ p: 3, textAlign: "center", backgroundColor: "#e3f2fd" }}
                >
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    {analytics.totalResponses}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Total Responses
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  elevation={2}
                  sx={{ p: 3, textAlign: "center", backgroundColor: "#e8f5e8" }}
                >
                  <Typography
                    variant="h3"
                    color="success.main"
                    fontWeight={700}
                  >
                    {analytics.questions.length}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Total Questions
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  elevation={2}
                  sx={{ p: 3, textAlign: "center", backgroundColor: "#fff3e0" }}
                >
                  <Typography
                    variant="h3"
                    color="warning.main"
                    fontWeight={700}
                  >
                    {analytics.questions.filter((q) => q.co || q.po).length}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    CO/PO Mapped Questions
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Individual Question Analytics */}
            {analytics.questions.map((question, index) => (
              <Card key={question.questionId} elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <Typography variant="h6" fontWeight={600} flex={1}>
                      {index + 1}. {question.questionText}
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Chip label={question.type} size="small" color="info" />
                      {question.co &&
                        question.co
                          .split(",")
                          .map((co) => (
                            <Chip
                              key={co}
                              label={`CO: ${co.trim()}`}
                              size="small"
                              color="primary"
                            />
                          ))}
                      {question.po &&
                        question.po
                          .split(",")
                          .map((po) => (
                            <Chip
                              key={po}
                              label={`PO: ${po.trim()}`}
                              size="small"
                              color="secondary"
                            />
                          ))}
                    </Box>
                  </Box>

                  {question.type === "rating" &&
                  question.regular.totalResponses > 0 ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box
                          textAlign="center"
                          p={2}
                          sx={{ backgroundColor: "#e3f2fd", borderRadius: 2 }}
                        >
                          <Typography
                            variant="h4"
                            color="primary"
                            fontWeight={700}
                          >
                            {question.regular.averageRating}
                          </Typography>
                          <Rating
                            value={question.regular.averageRating}
                            precision={0.1}
                            readOnly
                          />
                          <Typography variant="body2" color="text.secondary">
                            Average Rating ({question.regular.totalResponses}{" "}
                            responses)
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart
                            data={[
                              {
                                name: "1⭐",
                                count: question.regular.ratingCounts[1],
                              },
                              {
                                name: "2⭐",
                                count: question.regular.ratingCounts[2],
                              },
                              {
                                name: "3⭐",
                                count: question.regular.ratingCounts[3],
                              },
                              {
                                name: "4⭐",
                                count: question.regular.ratingCounts[4],
                              },
                              {
                                name: "5⭐",
                                count: question.regular.ratingCounts[5],
                              },
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#2196f3" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Grid>
                    </Grid>
                  ) : (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Responses ({question.regular.totalResponses}):
                      </Typography>
                      <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                        {question.regular.responses &&
                        question.regular.responses.length > 0 ? (
                          question.regular.responses
                            .slice(0, 10)
                            .map((response, idx) => (
                              <Paper
                                key={idx}
                                sx={{ p: 1, mb: 1, backgroundColor: "#f8f9fa" }}
                              >
                                <Typography variant="body2">
                                  {response}
                                </Typography>
                              </Paper>
                            ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No responses yet
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabPanel>

          {/* Tab 2: CO Reports */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom mb={3}>
              🎯 Course Outcome (CO) Performance Report
            </Typography>

            {/* CO Filter Section */}
            <Card
              elevation={3}
              sx={{ mb: 4, p: 3, backgroundColor: "#e8f5e8" }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                🔍 CO Report Filters
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Program Code"
                    value={coFilters.programcode}
                    onChange={(e) =>
                      setCoFilters({
                        ...coFilters,
                        programcode: e.target.value,
                      })
                    }
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Course Code"
                    value={coFilters.coursecode}
                    onChange={(e) =>
                      setCoFilters({ ...coFilters, coursecode: e.target.value })
                    }
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Year"
                    value={coFilters.year}
                    onChange={(e) =>
                      setCoFilters({ ...coFilters, year: e.target.value })
                    }
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                onClick={fetchCOReport}
                sx={{ mt: 2 }}
              >
                Generate CO Report
              </Button>
            </Card>

            {/* CO Results */}
            {coData && (
              <Box>
                <Typography variant="h6" gutterBottom mb={2}>
                  📊 CO Performance Results for {coData.programcode} -{" "}
                  {coData.coursecode} ({coData.year})
                </Typography>

                <Grid container spacing={3}>
                  {coData.coData.map((co) => (
                    <Grid item xs={12} md={6} lg={4} key={co._id}>
                      <Card elevation={3} sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            color="primary"
                            gutterBottom
                          >
                            {co._id}
                          </Typography>

                          <Box textAlign="center" mb={2}>
                            <Typography
                              variant="h4"
                              color="primary"
                              fontWeight={700}
                            >
                              {co.averageRating}
                            </Typography>
                            <Rating
                              value={co.averageRating}
                              precision={0.1}
                              readOnly
                            />
                            <Typography variant="body2" color="text.secondary">
                              Average Rating ({co.totalRatings} ratings from{" "}
                              {co.uniqueRespondents} users)
                            </Typography>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Typography variant="subtitle2" gutterBottom>
                            Rating Distribution:
                          </Typography>
                          <Grid container spacing={1} sx={{ mb: 2 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Grid item xs key={star}>
                                <Box textAlign="center">
                                  <Typography variant="caption">
                                    {star}⭐
                                  </Typography>
                                  <Typography variant="h6" color="primary">
                                    {co.ratingDistribution[`rating${star}`]}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>

                          <ResponsiveContainer width="100%" height={150}>
                            <BarChart
                              data={[
                                {
                                  name: "1",
                                  count: co.ratingDistribution.rating1,
                                },
                                {
                                  name: "2",
                                  count: co.ratingDistribution.rating2,
                                },
                                {
                                  name: "3",
                                  count: co.ratingDistribution.rating3,
                                },
                                {
                                  name: "4",
                                  count: co.ratingDistribution.rating4,
                                },
                                {
                                  name: "5",
                                  count: co.ratingDistribution.rating5,
                                },
                              ]}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill="#2196f3" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </TabPanel>

          {/* Tab 3: PO Reports */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom mb={3}>
              🏆 Program Outcome (PO) Performance Report
            </Typography>

            {/* PO Filter Section */}
            <Card
              elevation={3}
              sx={{ mb: 4, p: 3, backgroundColor: "#fce4ec" }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                🔍 PO Report Filters
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Program Code"
                    value={poFilters.programcode}
                    onChange={(e) =>
                      setPoFilters({
                        ...poFilters,
                        programcode: e.target.value,
                      })
                    }
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Year"
                    value={poFilters.year}
                    onChange={(e) =>
                      setPoFilters({ ...poFilters, year: e.target.value })
                    }
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="secondary"
                onClick={fetchPOReport}
                sx={{ mt: 2 }}
              >
                Generate PO Report
              </Button>
            </Card>

            {/* PO Results */}
            {poData && (
              <Box>
                <Typography variant="h6" gutterBottom mb={2}>
                  📊 PO Performance Results for {poData.programcode} (
                  {poData.year})
                </Typography>

                <Grid container spacing={3}>
                  {poData.poData.map((po) => (
                    <Grid item xs={12} md={6} lg={4} key={po._id}>
                      <Card elevation={3} sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            color="secondary"
                            gutterBottom
                          >
                            {po._id}
                          </Typography>

                          <Box textAlign="center" mb={2}>
                            <Typography
                              variant="h4"
                              color="secondary"
                              fontWeight={700}
                            >
                              {po.averageRating}
                            </Typography>
                            <Rating
                              value={po.averageRating}
                              precision={0.1}
                              readOnly
                            />
                            <Typography variant="body2" color="text.secondary">
                              Average Rating ({po.totalRatings} ratings from{" "}
                              {po.uniqueRespondents} users)
                            </Typography>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Typography variant="subtitle2" gutterBottom>
                            Rating Distribution:
                          </Typography>
                          <Grid container spacing={1} sx={{ mb: 2 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Grid item xs key={star}>
                                <Box textAlign="center">
                                  <Typography variant="caption">
                                    {star}⭐
                                  </Typography>
                                  <Typography variant="h6" color="secondary">
                                    {po.ratingDistribution[`rating${star}`]}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>

                          <Typography variant="subtitle2" gutterBottom>
                            Courses Covered:
                          </Typography>
                          <Box mb={2}>
                            {po.courses.map((course, idx) => (
                              <Chip
                                key={idx}
                                label={course}
                                size="small"
                                color="secondary"
                                sx={{ m: 0.5 }}
                                variant="outlined"
                              />
                            ))}
                          </Box>

                          <ResponsiveContainer width="100%" height={150}>
                            <BarChart
                              data={[
                                {
                                  name: "1",
                                  count: po.ratingDistribution.rating1,
                                },
                                {
                                  name: "2",
                                  count: po.ratingDistribution.rating2,
                                },
                                {
                                  name: "3",
                                  count: po.ratingDistribution.rating3,
                                },
                                {
                                  name: "4",
                                  count: po.ratingDistribution.rating4,
                                },
                                {
                                  name: "5",
                                  count: po.ratingDistribution.rating5,
                                },
                              ]}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill="#e91e63" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Container>
  );
}
