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
    Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ListAltIcon from "@mui/icons-material/ListAlt";
import StoreIcon from "@mui/icons-material/Store";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import global1 from "./global1";

const DashboardPurchaseds = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            title: "Create Requisition",
            description: "Request new items from the store.",
            icon: <ShoppingCartIcon sx={{ fontSize: 40, color: "white" }} />,
            color: "#1976d2", // Blue
            path: "/faculty-create-request"
        },
        {
            title: "My Requests Status",
            description: "Track the status of your material requests.",
            icon: <ListAltIcon sx={{ fontSize: 40, color: "white" }} />,
            color: "#2e7d32", // Green
            path: "/faculty-request-status"
        },
        {
            title: "Store Management",
            description: "Manage inventory and allot items.",
            icon: <StoreIcon sx={{ fontSize: 40, color: "white" }} />,
            color: "#ed6c02", // Orange
            path: "/store-manager-dashboard"
        },
        {
            title: "Purchase Cell",
            description: "Manage Purchase Orders and Vendors.",
            icon: <BusinessCenterIcon sx={{ fontSize: 40, color: "white" }} />,
            color: "#9c27b0", // Purple
            path: "/purchase-order-dashboard"
        },
        {
            title: "Delivery Management",
            description: "Receive deliveries and update stock.",
            icon: <LocalShippingIcon sx={{ fontSize: 40, color: "white" }} />,
            color: "#0288d1", // Light Blue
            path: "/delivery-dashboard"
        },
        {
            title: "Purchasing Master Data",
            description: "Manage Items, Stores, Vendors, and Types.",
            icon: <BusinessCenterIcon sx={{ fontSize: 40, color: "white" }} />,
            color: "#607d8b", // Blue Grey
            path: "/purchasing-master-data"
        },
        {
            title: "Faculty Request Approval",
            description: "Approve or Reject pending faculty requests.",
            icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "white" }} />,
            color: "#c2185b", // Pink
            path: "/FacultyRequestApprovalds"
        },
        {
            title: "Approval Configuration",
            description: "Configure Purchase Order Approval Steps.",
            icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "white" }} />,
            color: "#607d8b", // Blue Grey
            path: "/ApprovalConfigurationds"
        },
        {
            title: "Store Inventory",
            description: "View Store Inventory.",
            icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "white" }} />,
            color: "#607d8b", // Blue Grey
            path: "/PurchaseCellInventoryds"
        },
        {
            title: "Imprest Approval",
            description: "Approve Imprest Requests.",
            icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "white" }} />,
            color: "#d81b60", // Pink/Red
            path: "/ImprestManagerds" // Direct link to Imprest Manager
        }
    ];

    const handleLogout = () => {
        navigate("/dashdashfacnew");
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
                            Purchasing & Store Module
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
                                Home
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
};

export default DashboardPurchaseds;
