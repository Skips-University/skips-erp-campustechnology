import React, { useState, useEffect } from "react";
import {
  Container, Typography, Card, CardContent, Box, Grid, Paper,
  IconButton, LinearProgress, Rating
} from "@mui/material";
import { ArrowBack, People, BarChart, Star } from "@mui/icons-material";
import { PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useParams, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const COLORS = ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3'];
const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function FeedbackAnalytics() {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [feedbackId]);

  const fetchAnalytics = async () => {
    try {
      const res = await ep1.get("/api/v2/getfeedbackanalyticsds", {
        params: { feedbackId, colid: global1.colid }
      });
      setAnalytics(res.data);
    } catch (error) {
    }
    setLoading(false);
  };

  if (loading) return <Typography>Loading analytics...</Typography>;
  if (!analytics) return <Typography>No data available</Typography>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Card elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <Box 
            sx={{ 
              p: 3, 
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <IconButton color="inherit" onClick={() => navigate('/feedbackmanagement')}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                📊 Feedback Analytics
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {analytics.feedbackTitle}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {analytics.totalResponses}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Responses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <BarChart sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700} color="success.main">
                {analytics.questions.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Questions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Star sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {analytics.questions.filter(q => q.type === 'rating').length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Rating Questions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Question Analytics */}
      <Grid container spacing={4}>
        {analytics.questions.map((question, index) => (
          <Grid item xs={12} lg={6} key={question.questionId}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Q{index + 1}: {question.questionText}
                </Typography>
                
                {question.type === 'rating' && (
                  <Box>
                    {/* Average Rating Display */}
                    <Box textAlign="center" mb={3} p={2} sx={{ backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                        {question.averageRating}
                      </Typography>
                      <Rating 
                        value={question.averageRating} 
                        precision={0.1} 
                        readOnly 
                        size="large"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Average Rating ({question.totalResponses} responses)
                      </Typography>
                    </Box>

                    {/* Rating Distribution Bar Chart */}
                    <Box sx={{ height: 300, mb: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={Object.entries(question.ratingCounts).map(([rating, count]) => ({
                            rating: `${rating} Star${rating > 1 ? 's' : ''}`,
                            count,
                            label: RATING_LABELS[rating - 1]
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="rating" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [value, 'Responses']}
                            labelFormatter={(label, payload) => payload[0]?.payload?.label || label}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="#8884d8"
                            radius={[4, 4, 0, 0]}
                          >
                            {Object.entries(question.ratingCounts).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Detailed Rating Breakdown */}
                    <Box>
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = question.ratingCounts[rating] || 0;
                        const percentage = question.totalResponses > 0 ? (count / question.totalResponses) * 100 : 0;
                        
                        return (
                          <Box key={rating} mb={1}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2">{rating}</Typography>
                                <Star sx={{ fontSize: 16, color: '#ffc107' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {RATING_LABELS[rating - 1]}
                                </Typography>
                              </Box>
                              <Typography variant="body2" fontWeight={600}>
                                {count} ({percentage.toFixed(0)}%)
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              sx={{ 
                                height: 8, 
                                borderRadius: 1,
                                backgroundColor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: COLORS[rating - 1]
                                }
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {(question.type === 'text' || question.type === 'textarea') && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Total Responses: {question.totalResponses}
                    </Typography>
                    <Paper elevation={1} sx={{ p: 2, maxHeight: 300, overflow: 'auto', backgroundColor: '#f8f9fa' }}>
                      {question.responses.length > 0 ? (
                        question.responses.map((response, idx) => (
                          <Box key={idx} mb={1} p={2} sx={{ backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                            <Typography variant="body2">
                              "{response || "No response"}"
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          No responses yet
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
