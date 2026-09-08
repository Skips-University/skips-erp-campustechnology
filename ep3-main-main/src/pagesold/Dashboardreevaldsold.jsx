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
import AssessmentIcon from "@mui/icons-material/Assessment";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import global1 from "./global1";

function Dashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Exam Structure",
      description: "Setup exam papers and marks structure",
      icon: <AssignmentIcon sx={{ fontSize: 50, color: "#388e3c" }} />,
      path: "/examstructurepageds",
      color: "#e8f5e9",
    },
    {
      title: "Marks Entry",
      description: "Enter student marks for examinations",
      icon: <GradeIcon sx={{ fontSize: 50, color: "#f57c00" }} />,
      path: "/marksentrypageds",
      color: "#fff3e0",
    },
    {
      title: "Tabulation Register",
      description: "Generate tabulation register for students",
      icon: <SchoolIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
      path: "/tabulationregisterpageds",
      color: "#e3f2fd",
    },
    {
      title: "Transcript",
      description: "Generate transcript for students",
      icon: <SchoolIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
      path: "/transcriptpageds",
      color: "#e3f2fd",
    },
    {
      title: "Bulk Tabulation Register",
      description: "Generate bulk tabulation register for students",
      icon: <SchoolIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
      path: "/bulktabulationregisterpageds",
      color: "#e3f2fd",
    },
    // Add to menuItems array in Dashboard.jsx

    {
      title: "Reevaluation",
      description: "Apply for paper reevaluation",
      icon: <AssignmentIcon />,
      path: "/reevaluationapplicationds",
      color: "#f3e5f5",
    },
    {
      title: "Examiner Config",
      description: "Configure examiners for papers",
      icon: <SchoolIcon />,
      path: "/examinerconfigds",
      color: "#e1f5fe",
    },
    {
      title: "Examiner Evaluation",
      description: "Evaluate reevaluation papers",
      icon: <GradeIcon />,
      path: "/examinerevaluationds",
      color: "#fff9c4",
    },
    // New Reevaluation Flow Pages
    {
      title: "Reevaluation Application (New)",
      description: "Apply for paper reevaluation - max 2 papers",
      icon: <RateReviewIcon sx={{ fontSize: 40, color: "#e91e63" }} />,
      path: "/reevaluation-application-new",
      color: "#fce4ec",
    },
    {
      title: "Admin Reevaluation Management",
      description: "Manage and allocate reevaluation applications",
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 40, color: "#673ab7" }} />,
      path: "/admin-reevaluation-management",
      color: "#ede7f6",
    },
    {
      title: "Examiner Reevaluation Evaluation",
      description: "Evaluate reevaluation papers as examiner",
      icon: <AssignmentIcon sx={{ fontSize: 40, color: "#009688" }} />,
      path: "/examiner-reevaluation-evaluation",
      color: "#e0f2f1",
    },
    {
      title: "Admin Examiner 3 Allocation",
      description: "Allocate applications to examiner 3 (>20% increment)",
      icon: <PersonAddIcon sx={{ fontSize: 40, color: "#f44336" }} />,
      path: "/admin-examiner3-allocation",
      color: "#ffebee",
    },
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
            Institution ID: {global1.colid || "N/A"} | Role:{" "}
            {global1.role || "N/A"}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Dashboard;
