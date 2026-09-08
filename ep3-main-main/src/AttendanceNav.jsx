import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import global1 from "./pages/global1";
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  Paper,
  Tabs,
  Tab,
  Chip,
  Avatar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";


function LinkTab(props) {
  return (
    <Tab
      component={Link}
      {...props}
      sx={{
        fontWeight: props.selected ? "bold" : "normal",
        color: props.selected ? "primary.main" : "text.secondary",
      }}
    />
  );
}

export default function AttendanceNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = global1.user_role || "Student";

  const handleDashboardClick = () => {
    navigate("/classes");
  };

  return (
    <Box sx={{ minHeight: "90vh", bgcolor: "grey.100", p: 4 }}>
      {/* Header with Dashboard + Role Badge */}
      <AppBar position="static" elevation={0} color="transparent">
        <Toolbar sx={{ justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DashboardIcon />}
            onClick={handleDashboardClick}
          >
            Main Dashboard
          </Button>

          <Chip
            avatar={
              <Avatar
                sx={{
                  bgcolor: userRole === "Faculty" ? "orange.300" : "green.300",
                }}
              >
                {userRole.charAt(0)}
              </Avatar>
            }
            label={userRole}
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      {/* Navigation Tabs */}
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tabs
          value={location.pathname}
          textColor="primary"
          indicatorColor="primary"
        >
          <LinkTab
            icon={<CloudUploadIcon />}
            iconPosition="start"
            label="Upload"
            to="/attendance/upload"
            value="/attendance/upload"
            selected={location.pathname === "/attendance/upload"}
          />
        </Tabs>
      </Paper>

      {/* Nested routes */}
      <Box sx={{ mt: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
