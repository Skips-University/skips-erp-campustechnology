// pages/FacultyDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TextField,
  MenuItem
} from '@mui/material';
import {
  School as SeminarIcon,
  Science as ProjectIcon,
  Class as ClassIcon,
  ArrowForward as ArrowForwardIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as DepartmentIcon,
  AccountCircle as AccountCircleIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import ep1 from "../api/ep1.js";
import global1 from "./global1.js";

// Enhanced Styled Components with Fixed Dimensions and Different Gradients
const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  marginBottom: theme.spacing(8),
  borderRadius: 16,
  boxShadow: theme.shadows[8],
}));

// Fixed Size Stat Cards with Different Gradients
const StatCard2 = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink-Red gradient
  color: 'white',
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: 180, // Fixed height
  minHeight: 180,
  boxShadow: theme.shadows[6],
}));

const StatCard3 = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue-Cyan gradient
  color: 'white',
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: 180, // Fixed height
  minHeight: 180,
  boxShadow: theme.shadows[6],
}));

const StatCard4 = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green-Turquoise gradient
  color: 'white',
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: 180, // Fixed height
  minHeight: 180,
  boxShadow: theme.shadows[6],
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 'bold',
  marginBottom: theme.spacing(4), // Increased bottom margin to prevent overlapping
  marginTop: theme.spacing(2), // Added top margin for better spacing
  color: theme.palette.text.primary,
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 60,
  height: 60,
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginBottom: theme.spacing(2),
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
}));

const AcademicCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: theme.shadows[4],
}));

const FacultyDashboardds = () => {
  const navigate = useNavigate();
  const canCreateDashboard = String(global1.role || '').toLowerCase() === 'all';
  const [faculty, setFaculty] = useState(null);
  const [seminarData, setSeminarData] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboardId, setSelectedDashboardId] = useState('');
  const [loading, setLoading] = useState({
    profile: true,
    seminars: true,
    projects: true,
    classes: true,
    dashboards: true
  });
  const [error, setError] = useState(null);

  // Get email and colid from global1
  const facultyEmail = global1.user;
  const colid = global1.colid;

  useEffect(() => {
    if (facultyEmail && colid) {
      fetchAllData();
    } else {
      setError('Email or College ID not found in global state');
      setLoading({
        profile: false,
        seminars: false,
        projects: false,
        classes: false,
        dashboards: false
      });
    }
  }, [facultyEmail, colid]);

  const fetchAllData = async () => {
    const params = { email: facultyEmail, colid: colid };
    const role = global1.role || 'Faculty';

    try {
      const [
        profileResponse,
        seminarResponse,
        projectResponse,
        classResponse,
        dashboardResponse
      ] = await Promise.allSettled([
        ep1.get('/api/v2/getfacultyprofilds', { params }),
        ep1.get('/api/v2/getfacultyseminaranalyticsds', { params }),
        ep1.get('/api/v2/getfacultyprojectanalyticsds', { params }),
        ep1.get('/api/v2/getfacultyclassanalyticsds', { params }),
        ep1.get('/api/v2/dashboard-widget-dashboards', { params: { colid, status: 'Active' } })
      ]);

      // Handle responses
      if (profileResponse.status === 'fulfilled') {
        setFaculty(profileResponse.value.data);
      }
      if (seminarResponse.status === 'fulfilled') {
        setSeminarData(seminarResponse.value.data);
      }
      if (projectResponse.status === 'fulfilled') {
        setProjectData(projectResponse.value.data);
      }
      if (classResponse.status === 'fulfilled') {
        setClassData(classResponse.value.data);
      }
      if (dashboardResponse.status === 'fulfilled') {
        const data = dashboardResponse.value.data?.data || [];
        const roleDashboards = data.filter((item) => {
          const dashboardRole = String(item.role || '').toLowerCase();
          return dashboardRole === String(role).toLowerCase() || dashboardRole === 'all';
        });
        setDashboards(roleDashboards);
        setSelectedDashboardId((current) => current || roleDashboards[0]?._id || '');
      }

      setLoading({
        profile: false,
        seminars: false,
        projects: false,
        classes: false,
        dashboards: false
      });

    } catch (err) {
      setError('Failed to fetch dashboard data');
      setLoading({
        profile: false,
        seminars: false,
        projects: false,
        classes: false,
        dashboards: false
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (error) {
    return (
        
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            onClick={fetchAllData}
          >
            Retry
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <React.Fragment>
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Faculty Profile Section */}
      {loading.profile ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <ProfileCard>
          <StyledCardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm="auto">
                <Box display="flex" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  <Avatar
                    src={faculty?.photo}
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      border: '4px solid white',
                      boxShadow: 3
                    }}
                  >
                    <AccountCircleIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                </Box>
              </Grid>
              <Grid item xs={12} sm>
                <Box textAlign={{ xs: 'center', sm: 'left' }}>
                  <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Welcome, {faculty?.name || 'Faculty Member'}
                  </Typography>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    mt={2}
                    alignItems={{ xs: 'center', sm: 'flex-start' }}
                  >
                    <Chip
                      icon={<EmailIcon />}
                      label={faculty?.email}
                      variant="outlined"
                      sx={{ color: 'white', borderColor: 'white' }}
                    />
                    <Chip
                      icon={<DepartmentIcon />}
                      label={faculty?.department}
                      variant="outlined"
                      sx={{ color: 'white', borderColor: 'white' }}
                    />
                    {faculty?.phone && (
                      <Chip
                        icon={<PhoneIcon />}
                        label={faculty?.phone}
                        variant="outlined"
                        sx={{ color: 'white', borderColor: 'white' }}
                      />
                    )}
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm="auto">
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold">Valid till</Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                    {formatDate(faculty?.lastlogin)}
                  </Typography>
                   {/* <Button 
            variant="outlined" 
            onClick={() => navigate('/signinpay')}
          >
            Extend
          </Button> */}
            <Button
                    
                    variant="outlined"
                    // color="secondary"
                    
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 'auto', py: 1.5, color: 'white' }}
                    onClick={() => navigate('/signinpay')}
                  >
                    Extend
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </StyledCardContent>
        </ProfileCard>
      )}

      <Paper sx={{ p: 2.5, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold">Role dashboards</Typography>
            <Typography variant="body2" color="text.secondary">
              Select an active dashboard configured for {global1.role || 'this role'}.
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Dashboard"
              value={selectedDashboardId}
              onChange={(event) => setSelectedDashboardId(event.target.value)}
              disabled={loading.dashboards}
            >
              {dashboards.map((dashboard) => (
                <MenuItem key={dashboard._id} value={dashboard._id}>
                  {dashboard.dashboardname} ({dashboard.role})
                </MenuItem>
              ))}
              {!dashboards.length && <MenuItem value="">No dashboard available</MenuItem>}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction={{ xs: 'column', sm: 'row', md: 'row' }} spacing={1} sx={{ width: '100%' }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ whiteSpace: 'nowrap', minWidth: 88 }}
                disabled={!selectedDashboardId}
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate(`/dashboard-widget-view?id=${selectedDashboardId}`)}
              >
                Go
              </Button>
              {canCreateDashboard && (
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  sx={{ whiteSpace: 'nowrap', minWidth: 178 }}
                  onClick={() => navigate('/dashboard-widget-builder')}
                >
                  Create dashboard
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats with Fixed Dimensions and Different Gradients */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard2 elevation={6}>
            <IconContainer>
              <SeminarIcon sx={{ fontSize: 32 }} />
            </IconContainer>
            {loading.seminars ? (
              <CircularProgress size={40} color="inherit" />
            ) : (
              <>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {seminarData?.totalSeminars || 0}
                </Typography>
                <Typography variant="h6">Seminars Joined</Typography>
              </>
            )}
          </StatCard2>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard3 elevation={6}>
            <IconContainer>
              <ProjectIcon sx={{ fontSize: 32 }} />
            </IconContainer>
            {loading.projects ? (
              <CircularProgress size={40} color="inherit" />
            ) : (
              <>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {projectData?.totalProjects || 0}
                </Typography>
                <Typography variant="h6">Projects</Typography>
              </>
            )}
          </StatCard3>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard4 elevation={6}>
            <IconContainer>
              <ClassIcon sx={{ fontSize: 32 }} />
            </IconContainer>
            {loading.classes ? (
              <CircularProgress size={40} color="inherit" />
            ) : (
              <>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {classData?.totalClasses || 0}
                </Typography>
                <Typography variant="h6">Classes Conducted</Typography>
              </>
            )}
          </StatCard4>
        </Grid>
      </Grid>

      {/* Main Dashboard Content */}
      <Grid container spacing={4}>
        {/* Academic Activities Section */}
        <Grid item xs={12}>
          <SectionTitle variant="h4">
            <SeminarIcon sx={{ mr: 2, fontSize: 32 }} />
            Academic Activities
          </SectionTitle>

          <Grid container spacing={3}>
            {/* Seminars with Details */}
            <Grid item xs={12} md={4}>
              <AcademicCard elevation={4}>
                <StyledCardContent>
                  <CardHeader>
                    <SeminarIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {loading.seminars ? <CircularProgress size={30} /> : (seminarData?.totalSeminars || 0)}
                    </Typography>
                  </CardHeader>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Seminars Participated
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Total Amount: {formatCurrency(seminarData?.totalAmount)}
                  </Typography>
                  
                  {!loading.seminars && (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body1" fontWeight="medium">
                          View Details ({seminarData?.seminars?.length || 0})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Title</strong></TableCell>
                                <TableCell><strong>Year</strong></TableCell>
                                <TableCell><strong>Amount</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {seminarData?.seminars?.slice(0, 5).map((seminar, index) => (
                                <TableRow key={index}>
                                  <TableCell>{seminar.title}</TableCell>
                                  <TableCell>{seminar.yop}</TableCell>
                                  <TableCell>{formatCurrency(seminar.amount)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 'auto', py: 1.5 }}
                    onClick={() => navigate('/dashmseminar')}
                  >
                    View All Seminars
                  </Button>
                </StyledCardContent>
              </AcademicCard>
            </Grid>

            {/* Projects with Details */}
            <Grid item xs={12} md={4}>
              <AcademicCard elevation={4}>
                <StyledCardContent>
                  <CardHeader>
                    <ProjectIcon color="secondary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {loading.projects ? <CircularProgress size={30} /> : (projectData?.totalProjects || 0)}
                    </Typography>
                  </CardHeader>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Research Projects
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Total Funds: {formatCurrency(projectData?.totalFunds)}
                  </Typography>
                  
                  {!loading.projects && (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body1" fontWeight="medium">
                          View Details ({projectData?.projects?.length || 0})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Project</strong></TableCell>
                                <TableCell><strong>Agency</strong></TableCell>
                                <TableCell><strong>Funds</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {projectData?.projects?.slice(0, 5).map((project, index) => (
                                <TableRow key={index}>
                                  <TableCell>{project.project}</TableCell>
                                  <TableCell>{project.agency}</TableCell>
                                  <TableCell>{formatCurrency(project.funds)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 'auto', py: 1.5 }}
                    onClick={() => navigate('/dashmprojects')}
                  >
                    View All Projects
                  </Button>
                </StyledCardContent>
              </AcademicCard>
            </Grid>

            {/* Classes with Details */}
            <Grid item xs={12} md={4}>
              <AcademicCard elevation={4}>
                <StyledCardContent>
                  <CardHeader>
                    <ClassIcon color="success" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {loading.classes ? <CircularProgress size={30} /> : (classData?.totalClasses || 0)}
                    </Typography>
                  </CardHeader>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Classes Conducted
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    This Month: {classData?.classesThisMonth || 0}
                  </Typography>
                  
                  {!loading.classes && (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body1" fontWeight="medium">
                          View Details ({classData?.classes?.length || 0})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Course</strong></TableCell>
                                <TableCell><strong>Topic</strong></TableCell>
                                <TableCell><strong>Date</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {classData?.classes?.slice(0, 5).map((classItem, index) => (
                                <TableRow key={index}>
                                  <TableCell>{classItem.course}</TableCell>
                                  <TableCell>{classItem.topic}</TableCell>
                                  <TableCell>{formatDate(classItem.classdate)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    color="success"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 'auto', py: 1.5 }}
                    onClick={() => navigate('/classes')}
                  >
                    Manage Classes
                  </Button>
                </StyledCardContent>
              </AcademicCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Quick Navigation */}
      {/* <Box sx={{ mt: 6 }}>
        <SectionTitle variant="h4">
          Quick Navigation
        </SectionTitle>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<ClassIcon />}
              onClick={() => navigate('/classes')}
              sx={{ 
                py: 3,
                borderRadius: 3,
                fontSize: '1.1rem',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              Class Management
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/enrollment')}
              sx={{ 
                py: 3,
                borderRadius: 3,
                fontSize: '1.1rem',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              Enrollment Management
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<CalendarIcon />}
              onClick={() => navigate('/attendance')}
              sx={{ 
                py: 3,
                borderRadius: 3,
                fontSize: '1.1rem',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              Attendance Management
            </Button>
          </Grid>
        </Grid>
      </Box> */}
    </Container>
    </React.Fragment>
  );
};

export default FacultyDashboardds;
