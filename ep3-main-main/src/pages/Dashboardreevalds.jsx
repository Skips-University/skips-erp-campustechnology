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
import FactCheckIcon from "@mui/icons-material/FactCheck"; // New icon for Answer Sheet Evaluation
import global1 from "./global1";

function Dashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Exam Structure",
      description: "Setup exam papers and marks structure",
      icon: <SchoolIcon sx={{ fontSize: 40, color: "#4caf50" }} />,
      path: "/examstructurepageds",
      color: "#e8f5e9",
    },
    {
      title: "Marks Entry",
      description: "Enter student marks for examinations",
      icon: <AssignmentIcon sx={{ fontSize: 40, color: "#ff9800" }} />,
      path: "/marksentrypageds",
      color: "#fff3e0",
    },
    {
      title: "Answer Sheet Evaluation",
      description: "Evaluate answer sheets with question-wise marks",
      icon: <FactCheckIcon sx={{ fontSize: 40, color: "#2196f3" }} />,
      path: "/AnswerSheetEvaluationListPageds",
      color: "#e3f2fd",
    },
    {
      title: "Tabulation Register",
      description: "Generate tabulation register for students",
      icon: <GradeIcon sx={{ fontSize: 40, color: "#2196f3" }} />,
      path: "/tabulationregisterpageds",
      color: "#e3f2fd",
    },
    {
      title: "Transcript",
      description: "Generate transcript for students",
      icon: <AssessmentIcon sx={{ fontSize: 40, color: "#2196f3" }} />,
      path: "/transcriptpageds",
      color: "#e3f2fd",
    },
    {
      title: "Bulk Tabulation Register",
      description: "Generate bulk tabulation register for students",
      icon: <AssessmentIcon sx={{ fontSize: 40, color: "#2196f3" }} />,
      path: "/bulktabulationregisterpageds",
      color: "#e3f2fd",
    },
    {
      title: "Reevaluation",
      description: "Apply for paper reevaluation",
      icon: <RateReviewIcon sx={{ fontSize: 40, color: "#9c27b0" }} />,
      path: "/reevaluationapplicationds",
      color: "#f3e5f5",
    },
    {
      title: "Examiner Config",
      description: "Configure examiners for papers",
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 40, color: "#00bcd4" }} />,
      path: "/examinerconfigds",
      color: "#e1f5fe",
    },
    {
      title: "Examiner Evaluation",
      description: "Evaluate reevaluation papers",
      icon: <GradeIcon sx={{ fontSize: 40, color: "#ffeb3b" }} />,
      path: "/examinerevaluationds",
      color: "#fff9c4",
    },
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
      icon: <GradeIcon sx={{ fontSize: 40, color: "#009688" }} />,
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
    navigate("/dashdashfacnew");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }}>
              Academic Management System
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome, {global1.name || "User"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#1976d2", width: 50, height: 50 }}>
              {global1.name?.charAt(0) || "U"}
            </Avatar>
            <CardActionArea
              onClick={handleLogout}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1.5,
                borderRadius: 1,
                bgcolor: "#f44336",
                color: "white",
                "&:hover": { bgcolor: "#d32f2f" },
              }}
            >
              <ExitToAppIcon />
              <Typography>Back</Typography>
            </CardActionArea>
          </Box>
        </Box>

        {/* Menu Cards */}
        <Grid container spacing={3}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(item.path)}
                  sx={{ height: "100%", p: 2 }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      bgcolor: item.color,
                      borderRadius: 1,
                    }}
                  >
                    {item.icon}
                    <Typography variant="h6" textAlign="center" sx={{ fontWeight: "bold" }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {item.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Footer Info */}
        <Box sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}>
          <Typography variant="body2">
            Institution ID: {global1.colid || "N/A"} | Role: {global1.role || "N/A"}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Dashboard;
