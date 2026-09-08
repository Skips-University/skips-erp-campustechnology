import React from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import {
  Category as CategoryIcon,
  People as LeadsIcon,
  School as ProgramIcon,
  Web as LandingPageIcon,
  Campaign as CampaignIcon,
  Key as ApiKeyIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Source as SourceIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import global1 from "./global1";

const Dashboardds = () => {
  const navigate = useNavigate();

  const allModules = [
    {
      title: "Category & Counsellors",
      description: "Manage categories and assign counsellors",
      icon: <CategoryIcon sx={{ fontSize: 48, color: "#1976d2" }} />,
      route: "/categoryds",
    },
    {
      title: "Leads Management",
      description: "View and manage all leads",
      icon: <LeadsIcon sx={{ fontSize: 48, color: "#2e7d32" }} />,
      route: "/leadsds",
    },
    {
      title: "Leads Management Admin",
      description: "View and manage all leads",
      icon: <LeadsIcon sx={{ fontSize: 48, color: "#016306" }} />,
      route: "/leadsdsadmin",
    },
    {
      title: "Leads Bulk Action",
      description: "View and manage all leads",
      icon: <LeadsIcon sx={{ fontSize: 48, color: "#0a2b8dff" }} />,
      route: "/bulkleadsds",
    },
    {
      title: "Program Master",
      description: "Manage courses and programs",
      icon: <ProgramIcon sx={{ fontSize: 48, color: "#ed6c02" }} />,
      route: "/programmasterds",
    },
    {
      title: "Landing Pages",
      description: "Create and manage landing pages with QR codes",
      icon: <LandingPageIcon sx={{ fontSize: 48, color: "#9c27b0" }} />,
      route: "/landingpageds",
    },
    {
      title: "Drip Campaigns",
      description: "Setup automated email/SMS campaigns",
      icon: <CampaignIcon sx={{ fontSize: 48, color: "#d32f2f" }} />,
      route: "/dripcampaignds",
    },
    {
      title: "API Keys",
      description: "Manage API keys for integrations",
      icon: <ApiKeyIcon sx={{ fontSize: 48, color: "#0288d1" }} />,
      route: "/apikeyds",
    },
    {
      title: "Analytics",
      description: "View reports and analytics",
      icon: <AnalyticsIcon sx={{ fontSize: 48, color: "#f57c00" }} />,
      route: "/analyticsds",
    },
    {
      title: "Communication Settings",
      description: "Manage templates and call integrations",
      icon: <SettingsIcon sx={{ fontSize: 48, color: "#607d8b" }} />,
      route: "/communicationsettings",
    },
    {
      title: "Campaign Types",
      description: "Manage campaign types for drip campaigns",
      icon: <CampaignIcon sx={{ fontSize: 48, color: "#9c27b0" }} />,
      route: "/communicationsettings?tab=campaign-types",
    },
    {
      title: "Source Management",
      description: "Manage lead sources for tracking",
      icon: <SourceIcon sx={{ fontSize: 48, color: "#00897b" }} />,
      icon: <SourceIcon sx={{ fontSize: 48, color: "#00897b" }} />,
      route: "/sourceds",
    },
    {
      title: "Pipeline Stage Config",
      description: "Manage CRM pipeline stages",
      icon: <SettingsIcon sx={{ fontSize: 48, color: "#4f46e5" }} />,
      route: "/pipelinestageag",
    },
    {
      title: "Outcome Config",
      description: "Manage CRM outcomes",
      icon: <SettingsIcon sx={{ fontSize: 48, color: "#F59E0B" }} />,
      route: "/outcomeag",
    },
  ];

  const handleLogout = () => {
    if (global1.role === "Admin") {
      navigate("/dashmncas11admin")
    } else {
      navigate("/dashdashfacnew");
    }

  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      <AppBar position="static" sx={{ background: "linear-gradient(90deg, #1565c0 0%, #0d47a1 100%)", boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Career College CRM - Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mr: 2, fontWeight: 500 }}>
            Welcome, {global1.name}
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
            }}
          >
            Home
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: "#1c2434", letterSpacing: "-0.02em" }}>
            Welcome to CRM Management System
          </Typography>
          <Typography variant="h6" sx={{ color: "#64748b", fontWeight: 400 }}>
            Select a module below to get started
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {allModules.map((module, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  transition: "all 0.3s ease-in-out",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    borderColor: "rgba(21, 101, 192, 0.2)"
                  }
                }}
              >
                <CardActionArea
                  onClick={() => navigate(module.route)}
                  sx={{ height: "100%", p: 3 }}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <Box sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: "50%",
                      bgcolor: "rgba(241, 245, 249, 0.5)",
                      display: "inline-flex",
                      justifyContent: "center",
                      alignItems: "center"
                    }}>
                      {module.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 700, color: "#334155" }}>
                      {module.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6 }}>
                      {module.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboardds;
