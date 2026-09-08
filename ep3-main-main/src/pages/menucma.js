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

export function menucma() {
    const open = true;
    return (
        <div style={{ overflowY: 'scroll', height: 600, width: 300, fontSize: 10 }}>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Competent Authority</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/role/purchase-order-dashboard">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="PO Approval" />}
                    </ListItem>

                </AccordionDetails>
            </Accordion>
        </div>
    );
}
