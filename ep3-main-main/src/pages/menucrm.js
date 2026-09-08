import React, { useState } from 'react';
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
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import LeadsIcon from '@mui/icons-material/Leaderboard';
import ProgramIcon from '@mui/icons-material/School';
import LandingPageIcon from '@mui/icons-material/WebAsset';
import CampaignIcon from '@mui/icons-material/Campaign';
import ApiIcon from '@mui/icons-material/Api';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SourceIcon from '@mui/icons-material/Source';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { List, Typography } from '@mui/material';
import global1 from './global1';

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

export function menuitemscrm() {
  const open = true;

  return (
    <div style={{ overflowY: 'scroll', height: 600, width: 300, fontSize: 10 }}>

      {/* Dashboard Section */}
      <ListItem button component={RouterLink} to="/crmh-dashboard">
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Dashboard" />}
      </ListItem>

      {/* CRM Section */}
      <Accordion>
        <AccordionSummary aria-controls="panel-crm-content" id="panel-crm-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>CRM</Typography>}
        </AccordionSummary>
        <AccordionDetails>

          <ListItem button component={RouterLink} to="/dashboardcrmds">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="CRM Dashboard" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/leadsds">
            <ListItemIcon>
              <LeadsIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Leads" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/categoryds">
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Categories" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/sourceds">
            <ListItemIcon>
              <SourceIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Sources" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/oicrmrep2">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="CRM reports 1" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/crmupcommingfollowup">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Upcomming Followups" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/crmds-overdue-leads">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Overdue Leads" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/crmds-counsellor-wise-leads">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Counsellor Wise Leads" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/crmds-pipeline-stage-wise">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Pipeline Stage Wise" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/crmds-source-wise-leads">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Source Wise Leads" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/dashmcrmstage">
            <ListItemIcon>
              <EventNoteIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Counselor stage wise" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/crmdatewisenewleads">
            <ListItemIcon>
              <EventNoteIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Date Wise New Leads" />}
          </ListItem>
          {/* <ListItem button component={RouterLink} to="/viewcrmstagepivot">
            <ListItemIcon>
              <EventNoteIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Counsellot stage pivot" />}
          </ListItem> */}
          <ListItem button component={RouterLink} to="/viewcrmstagepivot2">
            <ListItemIcon>
              <EventNoteIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Counsellot stage pivot 2" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/crompipedrill">
            <ListItemIcon>
              <EventNoteIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="pipeline stage drilldown" />}
          </ListItem>

        </AccordionDetails>
      </Accordion>

      {/* Programs Section */}
      <Accordion>
        <AccordionSummary aria-controls="panel-programs-content" id="panel-programs-header">
          <ProgramIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>Programs</Typography>}
        </AccordionSummary>
        <AccordionDetails>
          <ListItem button component={RouterLink} to="/programmasterds">
            <ListItemIcon>
              <ProgramIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Program Master" />}
          </ListItem>
        </AccordionDetails>
      </Accordion>

      {/* Marketing Section */}
      <Accordion>
        <AccordionSummary aria-controls="panel-marketing-content" id="panel-marketing-header">
          <CampaignIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>Marketing</Typography>}
        </AccordionSummary>
        <AccordionDetails>
          <ListItem button component={RouterLink} to="/landingpageds">
            <ListItemIcon>
              <LandingPageIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Landing Pages" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/dripcampaignds">
            <ListItemIcon>
              <CampaignIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Drip Campaigns" />}
          </ListItem>
        </AccordionDetails>
      </Accordion>

      {/* Analytics Section */}
      <Accordion>
        <AccordionSummary aria-controls="panel-analytics-content" id="panel-analytics-header">
          <AnalyticsIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>Analytics</Typography>}
        </AccordionSummary>
        <AccordionDetails>
          <ListItem button component={RouterLink} to="/analyticsds">
            <ListItemIcon>
              <AnalyticsIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Analytics Dashboard" />}
          </ListItem>
        </AccordionDetails>
      </Accordion>

      {/* Settings Section */}
      <Accordion>
        <AccordionSummary aria-controls="panel-settings-content" id="panel-settings-header">
          <SettingsIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>Settings</Typography>}
        </AccordionSummary>
        <AccordionDetails>
          <ListItem button component={RouterLink} to="/communicationsettings">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Communication Settings" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/apikeyds">
            <ListItemIcon>
              <ApiIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="API Keys" />}
          </ListItem>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>Task assignment</Typography>}
        </AccordionSummary>
        <AccordionDetails>

          <ListItem button component={RouterLink} to="/taskcreatorpage">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Create Task" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/assigneetaskpage">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="My Tasks" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/approvertaskpage">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Approve Tasks" />}
          </ListItem>

        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>Settings</Typography>}
        </AccordionSummary>
        <AccordionDetails>



          <ListItem button component={RouterLink} to="/dashmquotanew">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI Credits" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/dashawsconfig">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AWS config" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/dashmpassword">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Change password" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/signinpay">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Subscription" />}
          </ListItem>



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