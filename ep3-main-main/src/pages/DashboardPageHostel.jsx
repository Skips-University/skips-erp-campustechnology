import React from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import {
  Hotel,
  People,
  Assessment,
  CardTravel,
  HowToVote,
  Restaurant,
  Settings,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import global1 from "./global1";


const DashboardPage = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Hostel Buildings",
      description: "Manage hostel buildings and rooms",
      icon: <Hotel sx={{ fontSize: 40 }} />,
      path: "/hostelbuldingmanager",
      color: "#1976d2",
    },
    {
      title: "Hostel Report",
      description: "View hostel occupancy reports",
      icon: <Assessment sx={{ fontSize: 40 }} />,
      path: "/hostelreport",
      color: "#388e3c",
    },
    {
      title: "Parent Details",
      description: "Configure student parent details",
      icon: <People sx={{ fontSize: 40 }} />,
      path: "/parent-details",
      color: "#f57c00",
    },
    {
      title: "GatePass Approval",
      description: "Approve student gateway pass requests",
      icon: <CardTravel sx={{ fontSize: 40 }} />,
      path: "/gateway-pass-approval",
      color: "#7b1fa2",
    },
    {
      title: "Building Staff Config",
      description: "Configure wardens and mess managers",
      icon: <Settings sx={{ fontSize: 40 }} />,
      path: "/building-staff-config",
      color: "#c62828",
    },
    {
      title: "Meal Polls",
      description: "Create and manage meal polls",
      icon: <HowToVote sx={{ fontSize: 40 }} />,
      path: "/mess-polls",
      color: "#00796b",
    },
    {
      title: "Mess Applications",
      description: "Approve mess applications",
      icon: <Restaurant sx={{ fontSize: 40 }} />,
      path: "/mess-applications",
      color: "#5d4037",
    },
   
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>
          Back
        </Button>
        <Typography variant="h4" gutterBottom>
          Hostel Management Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, {global1.name || "User"}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {menuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 2,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate(item.path)}
                  sx={{ backgroundColor: item.color }}
                >
                  Open
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DashboardPage;
