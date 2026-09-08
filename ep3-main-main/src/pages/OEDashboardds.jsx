import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper, Typography } from '@mui/material';
import OEPRAssignmentsds from './OEPRAssignmentsds';
import ImprestManagerds from './ImprestManagerds';
import PurchaseOrderDashboardds from './PurchaseOrderDashboardds';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const OEDashboardds = () => {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
            <Paper elevation={0} square sx={{ borderBottom: '1px solid #e0e0e0', px: 3, pt: 2, pb: 0, backgroundColor: '#fff' }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#1a237e' }}>
                    Officer Executive Dashboard
                </Typography>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="OE Dashboard Tabs"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 48,
                            fontSize: '0.95rem'
                        }
                    }}
                >
                    <Tab icon={<ShoppingCartIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="PO Workflow" />
                    <Tab icon={<AccountBalanceWalletIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Imprest Management" />
                </Tabs>
            </Paper>

            <Box p={3}>
                {value === 0 && <PurchaseOrderDashboardds role="OE" />}
                {value === 1 && <ImprestManagerds />}
            </Box>
        </Box>
    );
};

export default OEDashboardds;
