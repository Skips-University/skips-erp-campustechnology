import React from 'react';
import { styled } from '@mui/material/styles';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { Link as RouterLink } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
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
  <MuiAccordionSummary expandIcon={<ArrowDropDownIcon />} {...props} />
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

const MenuLink = ({ to, label }) => (
  <ListItem button component={RouterLink} to={to}>
    <ListItemIcon>
      <PersonIcon />
    </ListItemIcon>
    <ListItemText primaryTypographyProps={{ fontSize: '14px' }} primary={label} />
  </ListItem>
);

export function menuhod() {
  const open = true;

  return (
    <div style={{ overflowY: 'scroll', height: 600, width: 300, fontSize: 10 }}>
      <Accordion>
        <AccordionSummary aria-controls="hod-personal-data-content" id="hod-personal-data-header">
          <PersonIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>Personal data</Typography>}
        </AccordionSummary>
        <AccordionDetails>
          <MenuLink to="/dashmprojects" label="Projects" />
          <MenuLink to="/dashmpublications" label="Publications" />
          <MenuLink to="/dashmpatents" label="Patents" />
          <MenuLink to="/dashmteacherfellow" label="Fellowship and awards" />
          <MenuLink to="/dashmconsultancy" label="Consultancy" />
          <MenuLink to="/dashmphdguide" label="PhD Guideship" />
          <MenuLink to="/dashmseminar" label="Seminars participated" />
          <MenuLink to="/dashmbook" label="Books and chapters" />
          <MenuLink to="/dashmncas11" label="Classes taken" />
          <MenuLink to="/dashmncas12" label="Activities taken" />
          <MenuLink to="/dashmncas22" label="Publication (CAS)" />
          <MenuLink to="/dashmncas241" label="Research guidance" />
          <MenuLink to="/dashmncas242" label="Completed Projects" />
          <MenuLink to="/dashmncas243" label="Ongoing Projects" />
          <MenuLink to="/dashmncas251" label="Patents" />
          <MenuLink to="/dashmncas252" label="Policy Document" />
          <MenuLink to="/dashmncas26" label="Participation" />
          <MenuLink to="/dashmncas253" label="Awards or Fellowship" />
          <MenuLink to="/dashmncas23" label="ICT (CAS)" />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="hod-ai-chatbot-content" id="hod-ai-chatbot-header">
          <SettingsIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>AI Chatbot</Typography>}
        </AccordionSummary>
        <AccordionDetails>
          <MenuLink to="/dashmchatentry" label="AI Chatbot" />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="hod-purchase-store-content" id="hod-purchase-store-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>Purchase and Store</Typography>}
        </AccordionSummary>
        <AccordionDetails>
          <MenuLink to="/storepage" label="Store" />
          <MenuLink to="/categorypage" label="Category" />
          <MenuLink to="/stockpage1" label="Stock" />
          <MenuLink to="/budgetpage" label="Budget" />
          <MenuLink to="/indentpage1" label="Indent" />
          <MenuLink to="/indentapproval1" label="Indent Approval" />
          <MenuLink to="/indentapproval2" label="Indent approval comparative view" />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="hod-settings-content" id="hod-settings-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>Settings</Typography>}
        </AccordionSummary>
        <AccordionDetails>
          <MenuLink to="/dashmquotanew" label="AI Credits" />
          <MenuLink to="/dashawsconfig" label="AWS config" />
          <MenuLink to="/dashmpassword" label="Change password" />
          <MenuLink to="/signinpay" label="Subscription" />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export function secondaryListItems({ open }) {
  return (
    <div>
      <ListSubheader inset>Saved reports</ListSubheader>
      <ListItem button>
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        {open && <ListItemText primary="Current month" />}
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        {open && <ListItemText primary="Last quarter" />}
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        {open && <ListItemText primary="Year-end sale" />}
      </ListItem>
    </div>
  );
}
