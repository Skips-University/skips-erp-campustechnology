import React, { useState, useRef, useEffect } from 'react';
import { AppBar, Toolbar, Button, Menu, MenuItem, Box, Typography, styled, IconButton } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { adminMenuData } from '../utils/adminMenuData';
import global1 from '../pages/global1';

const NavbarContainer = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(90deg, #1976d2 0%, #0d47a1 100%)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    zIndex: 9999, // Ensure it sits on top of everything
}));

const NavButton = styled(Button)(({ theme, active }) => ({
    color: 'white',
    textTransform: 'none',
    fontSize: '14px',
    fontWeight: 500,
    minWidth: 'auto',
    padding: '6px 16px',
    whiteSpace: 'nowrap',
    borderRadius: '20px',
    transition: 'all 0.3s ease',
    backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        transform: 'translateY(-2px)',
    },
}));

const ScrollableMenuBox = styled(Box)({
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    overflowX: 'hidden',
    gap: '8px',
    padding: '0 16px',
    scrollBehavior: 'smooth',
});

const ScrollButton = styled(IconButton)(({ theme }) => ({
    color: 'white',
    padding: '4px',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'white',
    },
    '&.Mui-disabled': {
        color: 'rgba(255,255,255,0.3)',
        borderColor: 'rgba(255,255,255,0.1)',
    }
}));

const AdminNavbar = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentMenuIndex, setCurrentMenuIndex] = useState(null);
    const scrollContainerRef = useRef(null);
    const closeTimerRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Determine if we should show the navbar
    const isAdmin = global1.role === 'Admin';
    const isLoginPage = location.pathname === '/' || location.pathname.toLowerCase().includes('/login') || location.pathname.toLowerCase().includes('/sign');

    // If not admin OR we are on a login page, DO NOT RENDER anything
    const shouldRender = isAdmin && !isLoginPage;

    // INJECT GLOBAL STYLES TO HIDE OLD SIDEBAR/HEADER
    useEffect(() => {
        const styleId = 'admin-navbar-override';

        // Remove style if we shouldn't render
        if (!shouldRender) {
            const style = document.getElementById(styleId);
            if (style) style.remove();
            return;
        }

        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                /* Hide the old Drawer (sidebar) */
                .MuiDrawer-root {
                    display: none !important;
                }
                
                /* Hide the old AppBar (header), BUT exclude this one (NavbarContainer) */
                header.MuiAppBar-root:not(.admin-navbar-new) {
                    display: none !important;
                }
                
                /* Force the main content area to take full width and remove left margin */
                main {
                    display: block !important;
                    width: 100% !important;
                    margin-left: 0 !important;
                }

                /* Adjust container padding if needed */
                .MuiContainer-root {
                    max-width: 100% !important;
                }
            `;
            document.head.appendChild(style);
        }

        return () => {
            const style = document.getElementById(styleId);
            if (style) {
                style.remove();
            }
        };
    }, [shouldRender]); // Re-run if render status changes

    if (!shouldRender) return null;

    const handleMenuOpen = (event, index) => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
        setAnchorEl(event.currentTarget);
        setCurrentMenuIndex(index);
    };

    const handleMenuClose = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
        }
        setAnchorEl(null);
        setCurrentMenuIndex(null);
    };

    const handleMenuCloseDelayed = () => {
        closeTimerRef.current = setTimeout(() => {
            setAnchorEl(null);
            setCurrentMenuIndex(null);
        }, 100);
    };

    const handleNavigate = (path) => {
        navigate(path);
        handleMenuClose();
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
        }
    };

    return (
        <NavbarContainer position="fixed" className="admin-navbar-new">
            <Toolbar variant="regular" sx={{ minHeight: '64px' }}>
                <Typography
                    variant="h6"
                    noWrap
                    component={Link}
                    to="/admin-new"
                    sx={{
                        mr: 2,
                        display: { xs: 'none', md: 'flex' },
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        color: 'inherit',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                            opacity: 0.9
                        }
                    }}
                >
                    Admin Portal
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: 'calc(100% - 250px)' }}>
                    <ScrollButton onClick={() => scroll('left')} size="small">
                        <ChevronLeftIcon />
                    </ScrollButton>

                    <ScrollableMenuBox ref={scrollContainerRef}>
                        {adminMenuData.map((menu, index) => (
                            <div
                                key={index}
                                onMouseLeave={handleMenuCloseDelayed}
                                onMouseEnter={() => {
                                    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                                }}
                            >
                                <NavButton
                                    aria-controls={`menu-${index}`}
                                    aria-haspopup="true"
                                    onMouseEnter={(e) => handleMenuOpen(e, index)}
                                    endIcon={<ArrowDropDownIcon />}
                                    active={Boolean(anchorEl) && currentMenuIndex === index}
                                    onClick={(e) => handleMenuOpen(e, index)}
                                >
                                    {menu.title}
                                </NavButton>
                                <Menu
                                    id={`menu-${index}`}
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl) && currentMenuIndex === index}
                                    onClose={handleMenuClose}
                                    MenuListProps={{
                                        onMouseEnter: () => {
                                            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                                        },
                                        onMouseLeave: handleMenuCloseDelayed,
                                    }}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    PaperProps={{
                                        elevation: 5,
                                        sx: {
                                            mt: 0.5,
                                            borderRadius: '12px',
                                            minWidth: '200px',
                                            zIndex: 10000,
                                            pointerEvents: 'auto',
                                            '& .MuiMenuItem-root': {
                                                fontSize: '14px',
                                                padding: '10px 20px',
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5',
                                                    color: '#1976d2'
                                                }
                                            }
                                        }
                                    }}
                                    sx={{ pointerEvents: 'none' }}
                                    disableScrollLock={true}
                                    disablePortal={false}
                                >
                                    {menu.items.map((item, itemIndex) => (
                                        <MenuItem
                                            key={itemIndex}
                                            onClick={() => handleNavigate(item.path)}
                                        >
                                            {item.label}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </div>
                        ))}
                    </ScrollableMenuBox>

                    <ScrollButton onClick={() => scroll('right')} size="small">
                        <ChevronRightIcon />
                    </ScrollButton>
                </Box>

                <Button
                    color="inherit"
                    component={Link}
                    to="/Login" // Note: This goes to Login page, which will cause the navbar to disappear (correct behavior)
                    sx={{
                        ml: 'auto',
                        border: '1px solid rgba(255,255,255,0.5)',
                        borderRadius: '20px',
                        padding: '5px 20px',
                        '&:hover': {
                            borderColor: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                    }}
                >
                    Sign Out
                </Button>
            </Toolbar>
        </NavbarContainer>
    );
};

export default AdminNavbar;
