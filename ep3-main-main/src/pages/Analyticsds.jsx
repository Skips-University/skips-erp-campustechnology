import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  LinearProgress,
  Avatar,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  LocalFireDepartment as HotIcon,
  CheckCircle as ConvertedIcon,
  Refresh as RefreshIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LocationOn as LocationIcon,
  Source as SourceIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Analyticsds = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/getleadanalyticsds", {
        params: {
          colid: global1.colid,
          user: global1.user,
          role: global1.role,
        },
      });
      setAnalytics(res.data.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        bgcolor: 'white',
        borderRadius: 4,
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
          borderColor: `${color}30`
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          bgcolor: color,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-1px' }}>
              {value}
            </Typography>
            {subtitle && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <Chip
                  label={subtitle}
                  size="small"
                  sx={{
                    bgcolor: `${color}15`,
                    color: color,
                    fontWeight: 700,
                    height: 24,
                    fontSize: '0.75rem',
                    borderRadius: 1
                  }}
                />
              </Box>
            )}
          </Box>
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: `${color}10`,
              color: color,
              width: 56,
              height: 56,
              borderRadius: 3
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 28 } })}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/dashboardcrmds')}
            sx={{
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              '&:hover': { bgcolor: '#f8fafc' }
            }}
          >
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, letterSpacing: '-0.5px' }}>
              Analytics Overview
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Track your performance metrics and lead insights
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchAnalytics}
          sx={{
            bgcolor: 'white',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            py: 1,
            '&:hover': {
              bgcolor: '#f8fafc',
              borderColor: '#cbd5e1',
              boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
            }
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Leads"
            value={analytics?.totalLeads || 0}
            icon={<PeopleIcon />}
            color="#2563eb" // Blue
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Hot Leads"
            value={analytics?.hotLeads || 0}
            icon={<HotIcon />}
            color="#dc2626" // Red
            subtitle="High Priority"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Warm Leads"
            value={analytics?.warmLeads || 0}
            icon={<TrendingUpIcon />}
            color="#d97706" // Amber
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value={analytics?.conversionRate || "0%"}
            icon={<ConvertedIcon />}
            color="#059669" // Emerald
            subtitle={`${analytics?.convertedLeads || 0} Converted`}
          />
        </Grid>
      </Grid>

      <Box sx={{ width: '100%' }}>
        <Grid container spacing={4}>
          {/* Pipeline Stages */}
          <Grid item xs={12} md={6} lg={6} xl={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar variant="rounded" sx={{ bgcolor: "#eff6ff", color: "#2563eb", mr: 2, borderRadius: 2 }}>
                  <BarChartIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Pipeline Distribution
                </Typography>
              </Box>

              {analytics?.byStage?.map((stage, index) => {
                const maxVal = Math.max(...(analytics?.byStage?.map(s => s.count) || [1]));
                const percent = (stage.count / maxVal) * 100;
                const colors = ["#2563eb", "#d97706", "#059669", "#dc2626", "#7c3aed", "#db2777"];
                const color = colors[index % colors.length];

                return (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                        {stage._id || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {stage.count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percent}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: color,
                          borderRadius: 5,
                        }
                      }}
                    />
                  </Box>
                );
              })}
              {(!analytics?.byStage || analytics.byStage.length === 0) && (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                  <Typography color="text.secondary" sx={{ fontWeight: 500 }}>No pipeline data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Lead Sources */}
          <Grid item xs={12} md={6} lg={6} xl={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar variant="rounded" sx={{ bgcolor: "#fff7ed", color: "#ea580c", mr: 2, borderRadius: 2 }}>
                  <SourceIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Lead Sources
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {analytics?.bySource?.map((source, index) => {
                  const colors = ["#2563eb", "#ea580c", "#059669", "#d97706", "#dc2626", "#7c3aed"];
                  const color = colors[index % colors.length];

                  return (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: 'white',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: color,
                          bgcolor: `${color}05`,
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: `${color}15`,
                            color: color,
                            width: 40,
                            height: 40,
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            mr: 2,
                            borderRadius: 2
                          }}
                        >
                          {source._id?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                          {source._id || 'Unknown'}
                        </Typography>
                      </Box>
                      <Chip
                        label={source.count}
                        size="small"
                        sx={{
                          bgcolor: color,
                          color: 'white',
                          fontWeight: 700,
                          minWidth: 40,
                          height: 24
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
              {(!analytics?.bySource || analytics.bySource.length === 0) && (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                  <Typography color="text.secondary" sx={{ fontWeight: 500 }}>No source data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Category Performance */}
          <Grid item xs={12} md={6} lg={6} xl={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar variant="rounded" sx={{ bgcolor: "#ecfdf5", color: "#059669", mr: 2, borderRadius: 2 }}>
                  <CategoryIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Category Performance
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {analytics?.byCategory?.map((category, index) => {
                  const colors = ["#2563eb", "#ea580c", "#059669", "#d97706", "#dc2626", "#7c3aed"];
                  const color = colors[index % colors.length];

                  return (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card
                        elevation={0}
                        sx={{
                          textAlign: 'center',
                          p: 3,
                          bgcolor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: 3,
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            borderColor: color,
                            boxShadow: `0 10px 20px -10px ${color}40`
                          }
                        }}
                      >
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 800,
                            color: color,
                            mb: 1,
                            letterSpacing: '-1px'
                          }}
                        >
                          {category.count}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                          {category._id || 'Unknown'}
                        </Typography>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              {(!analytics?.byCategory || analytics.byCategory.length === 0) && (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                  <Typography color="text.secondary" sx={{ fontWeight: 500 }}>No category data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Location-wise Report */}
          <Grid item xs={12} md={6} lg={6} xl={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar variant="rounded" sx={{ bgcolor: "#eff6ff", color: "#3b82f6", mr: 2, borderRadius: 2 }}>
                  <LocationIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Location Distribution
                </Typography>
              </Box>

              {analytics?.byLocation && analytics.byLocation.length > 0 ? (
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: '#64748b', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>City</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#64748b', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>State</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: '#64748b', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Leads</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.byLocation.map((location, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:hover': { bgcolor: "#f8fafc" },
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600, color: '#334155' }}>
                            {location.city || '-'}
                          </TableCell>
                          <TableCell sx={{ color: '#64748b' }}>
                            {location.state || '-'}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={location.count}
                              size="small"
                              sx={{
                                bgcolor: "#eff6ff",
                                color: '#3b82f6',
                                fontWeight: 700,
                                borderRadius: 1
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                  <Typography color="text.secondary" sx={{ fontWeight: 500 }}>No location data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Analyticsds;
