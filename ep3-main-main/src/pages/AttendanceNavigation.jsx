import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import {
  Dashboard,
  Schedule,
  SupervisorAccount,
  Settings,
  Receipt,
  Security,
  MonetizationOn,
  Assignment,
  TrendingUp,
  AccountBalance,
  Work,
  Person,
  Business,
  AdminPanelSettings,
  ArrowBack
} from '@mui/icons-material';
import global1 from './global1';

const AttendanceNavigation = () => {
  const navigate = useNavigate();

  const allMenuItems = [
    {
      id: 'dashboard',
      title: 'Attendance Dashboard',
      description: 'Check in/out and view your attendance',
      icon: <Dashboard sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      category: 'employee',
      path: '/attendance-dashboard'
    },
    {
      id: 'records',
      title: 'My Records',
      description: 'View your attendance history',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
      category: 'employee',
      path: '/attendance-records'
    },
    {
      id: 'admin-view',
      title: 'Admin Attendance',
      description: 'View all employee attendance',
      icon: <SupervisorAccount sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #8E24AA 0%, #BA68C8 100%)',
      category: 'admin',
      path: '/admin-attendance'
    },
    {
      id: 'salary-management',
      title: 'Salary Management',
      description: 'Configure salaries and calculate pay',
      icon: <MonetizationOn sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
      category: 'admin',
      path: '/salary-management'
    },
    {
      id: 'salary-slips',
      title: 'Salary Slips',
      description: 'View and download salary slips',
      icon: <Receipt sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
      category: 'admin',
      path: '/salary-slips'
    },
    {
      id: 'settings',
      title: 'Attendance Settings',
      description: 'Configure policies and timings',
      icon: <Settings sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      category: 'admin',
      path: '/attendance-settings'
    },
    {
      id: 'ip-management',
      title: 'IP Management',
      description: 'Manage authorized IP addresses',
      icon: <Security sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
      category: 'admin',
      path: '/ip-management'
    }
  ];

  const employeeMenuItems = allMenuItems.filter(item => item.category === 'employee');
  const adminMenuItems = allMenuItems.filter(item => item.category === 'admin');

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Paper elevation={3} sx={{ 
        p: 4, 
        mb: 4, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white',
        borderRadius: 3
      }}>
        <Box display="flex" alignItems="center" justify="space-between">
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar sx={{ 
              bgcolor: 'white', 
              color: 'primary.main', 
              width: 64, 
              height: 64,
              fontSize: '2rem'
            }}>
              <Work />
            </Avatar>
            <Box>
              <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2, color: 'white' }}>
                Back
              </Button>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Attendance & Payroll System
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Welcome back, {global1.name}
              </Typography>
              <Box display="flex" gap={2} mt={2}>
                <Chip 
                  icon={<Person />}
                  label={global1.role} 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Chip 
                  icon={<Business />}
                  label={global1.user} 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white'
                  }}
                />
                <Chip 
                  icon={<AdminPanelSettings />}
                  label="Admin Access" 
                  sx={{ 
                    bgcolor: 'rgba(255,215,0,0.3)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            textAlign: 'center', 
            p: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <Schedule sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Today's Status</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Check your attendance
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            textAlign: 'center', 
            p: 3,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <TrendingUp sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">This Month</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              View monthly stats
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            textAlign: 'center', 
            p: 3,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <AccountBalance sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Salary Info</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              View salary details
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            textAlign: 'center', 
            p: 3,
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <Assignment sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Records</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Access all records
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Employee Features */}
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'text.primary', mb: 3 }}>
        Employee Features
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {employeeMenuItems.map((item) => (
          <Grid key={item.id} item xs={12} sm={6} md={6}>
            <Card 
              elevation={6}
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                },
                borderRadius: 3,
                background: item.gradient
              }}
              onClick={() => handleNavigation(item.path)}
            >
              <CardContent sx={{ p: 4, color: 'white' }}>
                <Box display="flex" alignItems="flex-start" gap={3}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 80, 
                    height: 80,
                    color: 'white'
                  }}>
                    {item.icon}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                      {item.description}
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        borderRadius: 2,
                        px: 3
                      }}
                    >
                      Access Now
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Admin Features */}
      <Divider sx={{ my: 4 }} />
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'text.primary', mb: 3 }}>
        Administrative Features
      </Typography>
      
      <Grid container spacing={3}>
        {adminMenuItems.map((item) => (
          <Grid key={item.id} item xs={12} sm={6} lg={4}>
            <Card 
              elevation={6}
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                },
                borderRadius: 3,
                background: item.gradient
              }}
              onClick={() => handleNavigation(item.path)}
            >
              <CardContent sx={{ p: 4, color: 'white' }}>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={2}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 80, 
                    height: 80,
                    color: 'white'
                  }}>
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                      {item.description}
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        borderRadius: 2
                      }}
                    >
                      Manage
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box mt={6} textAlign="center">
        <Typography variant="h5" fontWeight="bold" gutterBottom color="text.secondary">
          Quick Actions
        </Typography>
        <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap" mt={3}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Dashboard />}
            onClick={() => handleNavigation('/attendance-dashboard')}
            sx={{ 
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              borderRadius: 2,
              px: 3
            }}
          >
            Dashboard
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<SupervisorAccount />}
            onClick={() => handleNavigation('/admin-attendance')}
            sx={{ 
              background: 'linear-gradient(45deg, #8E24AA 30%, #BA68C8 90%)',
              borderRadius: 2,
              px: 3
            }}
          >
            Admin View
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<MonetizationOn />}
            onClick={() => handleNavigation('/salary-management')}
            sx={{ 
              background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
              borderRadius: 2,
              px: 3
            }}
          >
            Salary
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AttendanceNavigation;
