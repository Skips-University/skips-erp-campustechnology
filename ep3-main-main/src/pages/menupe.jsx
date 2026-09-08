import React from 'react';
import { styled } from '@mui/material/styles';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link as RouterLink } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { Typography } from '@mui/material';

const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&::before': {
        display: 'none',
    },
}));

const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
        expandIcon={<ArrowDropDownIcon />}
        {...props}
    />
))(({ theme }) => ({
    backgroundColor:
        theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, .05)'
            : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
    },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

export function menupe() {
    const open = true;
    return (
        <div style={{ overflowY: 'scroll', height: 600, width: 300, fontSize: 10 }}>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    <Typography sx={{ fontSize: 14 }}>Purchase Executive</Typography>

                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/role/oe-dashboard">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="PE Dashboard" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/role/purchase-order-dashboard">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Purchase Orders" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/role/PurchaseCellInventoryds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Store Inventory" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/role/cash-approval">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Cash Approval" />}
                    </ListItem>

                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Ticketing</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/creategrievanceds1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Raised ticket" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>AI Service</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/manageapikeyds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Gemini API Key" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/geminichatds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Chat to Solve" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Profile Page</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/studentprofiledsoct18">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Profile" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

        </div>
    );
}
