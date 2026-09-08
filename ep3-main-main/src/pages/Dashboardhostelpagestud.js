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
  ExitToApp,
  CardTravel,
  HowToVote,
  Restaurant,
  Assignment,
  Settings,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import global1 from "./global1";

const DashboardPage = () => {
  const navigate = useNavigate();

  const menuItems = [
    
    
   
   
  
    {
      title: "Student GatePass",
      description: "Apply for gateway pass",
      icon: <ExitToApp sx={{ fontSize: 40 }} />,
      path: "/student-gateway-pass",
      color: "#0288d1",
    },
    {
      title: "GatePass Status",
      description: "Check gateway pass status",
      icon: <Assignment sx={{ fontSize: 40 }} />,
      path: "/student-gateway-status",
      color: "#303f9f",
    },
    {
      title: "Meal Voting",
      description: "Vote for meal preferences",
      icon: <Restaurant sx={{ fontSize: 40 }} />,
      path: "/student-meal-vote",
      color: "#689f38",
    },
    {
      title: "Mess Application",
      description: "Apply for mess facility",
      icon: <Restaurant sx={{ fontSize: 40 }} />,
      path: "/student-mess-application",
      color: "#fbc02d",
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
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
