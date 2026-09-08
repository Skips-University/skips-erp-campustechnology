import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GradeIcon from "@mui/icons-material/Grade";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import global1 from "./global1";

function Dashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Create Grievance",
      description: "Submit a new grievance for resolution.",
      icon: <AssignmentIcon sx={{ fontSize: 40, color: "white" }} />,
      color: "#1976d2",
      path: "/creategrievanceds",
    },
    {
      title: "Grievance Dashboard",
      description: "View and manage all grievances.",
      icon: <AssignmentIcon sx={{ fontSize: 40, color: "white" }} />,
      color: "#1976d2",
      path: "/admingrievancedashboardds",
    },
    {
      title: "Assignee Grievance Page",
      description: "View grievances assigned to you.",
      icon: <AssignmentIcon sx={{ fontSize: 40, color: "white" }} />,
      color: "#1976d2",
      path: "/assigneegrievancepageds",
    },
    {
      title: "Manage Grievance Categories",
      description: "Add, edit, or delete grievance categories.",
      icon: <GradeIcon sx={{ fontSize: 40, color: "white" }} />,
      color: "#388e3c",
      path: "/managegrievancecategoriesds",
    },
    {
      title: "Manage Category Assignees",
      description: "Assign users to grievance categories.",
      icon: <SchoolIcon sx={{ fontSize: 40, color: "white" }} />,
      color: "#f57c00",
      path: "/managecategoryassigneeds",
    }
  ];

  const handleLogout = () => {
    // Clear global1 data
    global1.name = "";
    global1.colid = "";
    global1.user = "";
    global1.regno = "";
    global1.role = "";
    navigate("/");
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            p: 3,
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Academic Management System
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Welcome, {global1.name || "User"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#1976d2", width: 50, height: 50 }}>
              {global1.name?.charAt(0) || "U"}
            </Avatar>
            <Box
              sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
              onClick={handleLogout}
            >
              <ExitToAppIcon sx={{ mr: 1, color: "#d32f2f" }} />
              <Typography variant="body2" color="#d32f2f">
                Logout
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Menu Cards */}
        <Grid container spacing={3}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(item.path)}
                  sx={{ height: "100%", p: 2 }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: item.color,
                          p: 2,
                          borderRadius: "50%",
                          mb: 2,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Footer Info */}
        <Box
          sx={{
            mt: 4,
            p: 2,
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 1,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Institution ID: {global1.colid || "N/A"} | Role: {global1.role || "N/A"}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Dashboard;
