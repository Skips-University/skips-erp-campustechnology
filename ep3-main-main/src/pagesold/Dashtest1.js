import React from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const summaryStats = [
  {
    title: 'Users',
    value: '1,245',
    icon: <PeopleIcon color="primary" fontSize="large" />,
  },
  {
    title: 'Revenue',
    value: '₹12.5L',
    icon: <AttachMoneyIcon color="success" fontSize="large" />,
  },
  {
    title: 'Orders',
    value: '894',
    icon: <ShoppingCartIcon color="secondary" fontSize="large" />,
  },
  {
    title: 'Growth',
    value: '8.5%',
    icon: <TrendingUpIcon color="action" fontSize="large" />,
  },
];

const lineData = [
  { month: 'Jan', users: 400 },
  { month: 'Feb', users: 500 },
  { month: 'Mar', users: 600 },
  { month: 'Apr', users: 800 },
  { month: 'May', users: 1000 },
];

const barData = [
  { department: 'HR', audits: 5 },
  { department: 'Admin', audits: 3 },
  { department: 'Academics', audits: 6 },
  { department: 'Finance', audits: 2 },
];

const EnterpriseDashboard = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Enterprise Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        {summaryStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={3} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <Box mr={2}>{stat.icon}</Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  {stat.title}
                </Typography>
                <Typography variant="h6">{stat.value}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={4} sx={{ mt: 1 }}>
        {/* Line Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Growth Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#1976d2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Audits Per Department
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="audits" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EnterpriseDashboard;
