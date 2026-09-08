import React, { useState, useEffect } from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import global1 from '../pages/global1';

// Import Role Menus
import { menupurchasepu as MenuPurchase } from '../pages/menupurchasepu';
import { menustore as MenuStore } from '../pages/menustore';
import { menuoe as MenuOE } from '../pages/menuoe';
import { menucma as MenuCMA } from '../pages/menucma';
import { menuao as MenuAO } from '../pages/menuao';
import { menupe as MenuPE } from '../pages/menupe';
import { getTitle } from '../utils/routeTitles';
import ActivityPointBadge from '../pages/ActivityPointBadge';
import TopMenuSearch from '../pages/TopMenuSearch';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

const mdTheme = createTheme();

function RoleLayoutContent({ children, customMenu }) {
    const [open, setOpen] = useState(true);
    const [role, setRole] = useState(global1.role);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        // Clear user session data if any
        localStorage.clear();
        // Redirect to login page
        window.location.href = '/Login';
    };

    useEffect(() => {
        // Ensure role is up to date, though global1 is static object usually
        setRole(global1.role);
    }, [global1]);

    const getMenuComponent = () => {
        if (customMenu) {
            const CustomMenu = customMenu;
            return <CustomMenu />;
        }
        // Normalize role string comparison
        const r = role;
        console.log('RoleLayout: User Role is', r);

        // Matches titles in menu files
        if (r === 'Purchasepu') return <MenuPurchase />;
        if (r === 'Store') return <MenuStore />;
        if (r === 'OE') return <MenuOE />;
        if (r === 'CA') return <MenuCMA />;
        if (r === 'AE') return <MenuAO />;
        if (r === 'PE') return <MenuPE />;

        // Default fallback or simplified view
        return <MenuPurchase />;
    };

    return (
        <ThemeProvider theme={mdTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" open={open}>
                    <Toolbar
                        sx={{
                            pr: '24px', // keep right padding when drawer closed
                        }}
                    >
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            {getTitle(location.pathname)}
                        </Typography>
                        <TopMenuSearch />
                        <ActivityPointBadge sx={{ ml: 2 }} />
                        <Button
                            color="inherit"
                            startIcon={<HomeIcon />}
                            onClick={() => navigate('/dashdashfacnew')} // Redirect to Dashboard
                            sx={{ ml: 2 }}
                        >
                            Home
                        </Button>
                        <Button
                            color="inherit"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{ ml: 1 }}
                        >
                            Logout
                        </Button>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <Toolbar
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            px: [1],
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="body1"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1, marginLeft: 2 }}
                        >
                            {global1.name}
                        </Typography>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    {/* Render the Role-Specific Menu */}
                    {getMenuComponent()}
                </Drawer>
                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'auto',
                    }}
                >
                    <Toolbar />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                        {children}
                        {/* <Copyright sx={{ pt: 4 }} /> */}
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default function RoleLayout({ children, menu }) {
    return <RoleLayoutContent children={children} customMenu={menu} />;
}
