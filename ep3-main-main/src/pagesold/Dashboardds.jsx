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
  Store as VendorIcon,
  Inventory as ProductIcon,
  ShoppingCart as VendorProductIcon,
  RequestQuote as RequestIcon,
  Assignment as PurchaseIcon,
  Payment as PaymentIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import global1 from "./global1";
import { AssignmentReturn as ReturnIcon } from "@mui/icons-material";

const Dashboardds = () => {
  const navigate = useNavigate();

  const allModules = [
    {
      title: "Vendor Management",
      icon: <VendorIcon sx={{ fontSize: 60, color: "#1976d2" }} />,
      route: "/vendormanagementds",
      description: "Manage vendors and suppliers",
    },
    {
      title: "Product Management",
      icon: <ProductIcon sx={{ fontSize: 60, color: "#2e7d32" }} />,
      route: "/productmanagementds",
      description: "Manage product catalog",
    },
    {
      title: "Vendor Products",
      icon: <VendorProductIcon sx={{ fontSize: 60, color: "#ed6c02" }} />,
      route: "/vendorproductmanagementds",
      description: "Manage vendor product listings",
    },
    {
      title: "Product Requests (Faculty)",
      icon: <RequestIcon sx={{ fontSize: 60, color: "#0288d1" }} />,
      route: "/productrequestds",
      description: "Submit product requests",
    },
    {
      title: "Product Requests (Admin)",
      icon: <AdminIcon sx={{ fontSize: 60, color: "#9c27b0" }} />,
      route: "/productrequestadminds",
      description: "Approve/Reject faculty requests",
    },
    {
      title: "Purchase Management",
      icon: <PurchaseIcon sx={{ fontSize: 60, color: "#d32f2f" }} />,
      route: "/purchasemanagementds",
      description: "Manage purchase orders",
    },
    {
      title: "Payment Management",
      icon: <PaymentIcon sx={{ fontSize: 60, color: "#388e3c" }} />,
      route: "/paymentmanagementds",
      description: "Manage payments and invoices",
    },
    {
      title: "Search Purchases",
      icon: <PurchaseIcon sx={{ fontSize: 60, color: "#f57c00" }} />,
      route: "/purchasedsearchds",
      description: "Search purchases by product name",
    },
    {
      title: "Product Returns",
      icon: <ReturnIcon fontSize="large" />,
      route: "/returnmanagementds",
      description: "Manage product returns and refunds",
    },
  ];

  const handleLogout = () => {
    global1.name = "";
    global1.colid = "";
    global1.user = "";
    global1.role = "";
    navigate("/");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            University Procurement CRM - Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {global1.name}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Procurement Management System
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a module below to get started
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {allModules.map((module, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={3}
                sx={{
                  height: "100%",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(module.route)}
                  sx={{ height: "100%", p: 2 }}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    {module.icon}
                    <Typography variant="h6" component="div" sx={{ mt: 2 }}>
                      {module.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
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
