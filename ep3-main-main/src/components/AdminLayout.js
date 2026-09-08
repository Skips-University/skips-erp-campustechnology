import React from 'react';
import { Box, CssBaseline, Toolbar, styled } from '@mui/material';
import AdminNavbar from './AdminNavbar';

const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    // No need for marginLeft transition since we replaced the sidebar with a top navbar
    marginTop: '48px', // Adjust based on Navbar height (dense toolbar is ~48px)
    height: '100vh',
    overflow: 'auto',
    backgroundColor: theme.palette.grey[100],
}));

const AdminLayout = ({ children, title }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <CssBaseline />
            <AdminNavbar />
            {/* Spacer for fixed AppBar */}
            {/* <Toolbar />  */}

            <MainContent component="main">
                {/* We can add a Breadcrumb or Page Title area here if needed by props */}
                {children}
            </MainContent>
        </Box>
    );
};

export default AdminLayout;
