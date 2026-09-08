import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Divider, IconButton } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    Book as BookIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    Assessment as AssessmentIcon,
    ArrowBack
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboardmeritlist' },
        { text: 'Programmes', icon: <SchoolIcon />, path: '/programmesmeritlist' },
        { text: 'Subjects', icon: <BookIcon />, path: '/subjectsmeritlist' },
        { text: 'Students', icon: <PeopleIcon />, path: '/studentsmeritlist' },
        { text: 'Allocations', icon: <AssignmentIcon />, path: '/allocationsmeritlist' },
        { text: 'Reports', icon: <AssessmentIcon />, path: '/reportsmeritlist' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Box>
                        <Typography>
                            <IconButton color="inherit" onClick={() => navigate("/dashdashfacnew")}>
                                <ArrowBack />
                            </IconButton>
                        </Typography>
                    </Box>
                    <Typography variant="h6" noWrap component="div">
                        MDM Allocation System
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                                sx={{
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.light',
                                        color: 'primary.contrastText',
                                        '& .MuiListItemIcon-root': { color: 'primary.contrastText' }
                                    }
                                }}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
