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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HostelIcon from '@mui/icons-material/Hotel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { List, Typography } from '@mui/material';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddTaskIcon from '@mui/icons-material/AddTask';
import AdjustIcon from '@mui/icons-material/Adjust';
import ApprovalIcon from '@mui/icons-material/Approval';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AutofpsSelectIcon from '@mui/icons-material/AutofpsSelect';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import BathroomIcon from '@mui/icons-material/Bathroom';
import BalconyIcon from '@mui/icons-material/Balcony';
import BarChartIcon from '@mui/icons-material/BarChart';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import Battery4BarIcon from '@mui/icons-material/Battery4Bar';
import BookIcon from '@mui/icons-material/Book';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import global1 from './global1';

const getlink = () => {
  return '/eventlistwithcolid/' + global1.colid;
}


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

export function menustore() {
  const open = true;
  return (
    <div style={{ overflowY: 'scroll', height: 600, width: 300, fontSize: 10 }}>

      <Accordion>
        <AccordionSummary aria-controls="panel2-content" id="panel2-header">
          <SettingsIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>AI Chatbot</Typography>}
        </AccordionSummary>
        <AccordionDetails>




          {/* <ListItem button component={RouterLink} to="/dashchattest">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Personal data" />}
</ListItem> */}

          {/* <ListItem button component={RouterLink} to="/dashmchatentry">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="AI Chatbot" />}
</ListItem> */}

          <ListItem button component={RouterLink} to="/role/dashchattest4d">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI Chatbot" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/role/dashmtall">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Config Tables" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/role/dashmtfields">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Config Fields" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/role/dashmtbcolumnsall">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Columns" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/role/dashmtblapi">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="API Configuration" />}
          </ListItem>


        </AccordionDetails>
      </Accordion>

      {/* API Data Extractor */}
      <Accordion>
        <AccordionSummary
          aria-controls="panel-api-content"
          id="panel-api-header"
        >
          <SettingsIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>API Data Extractor</Typography>}
        </AccordionSummary>
        <AccordionDetails>
          <ListItem button component={RouterLink} to="/role/apichatbot">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && (
              <ListItemText
                primaryTypographyProps={{ fontSize: '14px' }}
                primary="API Chatbot"
              />
            )}
          </ListItem>
          <ListItem button component={RouterLink} to="/role/apichatbot1">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && (
              <ListItemText
                primaryTypographyProps={{ fontSize: '14px' }}
                primary="AI API Report"
              />
            )}
          </ListItem>
          <ListItem button component={RouterLink} to="/role/apiconfig">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            {open && (
              <ListItemText
                primaryTypographyProps={{ fontSize: '14px' }}
                primary="Configure API"
              />
            )}
          </ListItem>
          <ListItem button component={RouterLink} to="/role/aidatamanager">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && (
              <ListItemText
                primaryTypographyProps={{ fontSize: '14px' }}
                primary="AI Data Upload API"
              />
            )}
          </ListItem>
          <ListItem button component={RouterLink} to="/role/dataconfig">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            {open && (
              <ListItemText
                primaryTypographyProps={{ fontSize: '14px' }}
                primary="Configure API Data"
              />
            )}
          </ListItem>
          <ListItem button component={RouterLink} to="/role/workflowchatbotds">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            {open && (
              <ListItemText
                primaryTypographyProps={{ fontSize: '14px' }}
                primary="Work Flow Chatbot"
              />
            )}
          </ListItem>
          <ListItem button component={RouterLink} to="/role/workflowconfigds">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            {open && (
              <ListItemText
                primaryTypographyProps={{ fontSize: '14px' }}
                primary="Work Flow Config"
              />
            )}
          </ListItem>
          <ListItem button component={RouterLink} to="/role/workflowchatbotds1">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            {open && (
              <ListItemText
                primaryTypographyProps={{ fontSize: '14px' }}
                primary="New Work Flow Chatbot"
              />
            )}
          </ListItem>
          <ListItem button component={RouterLink} to="/role/workflowconfigds1">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            {open && (
              <ListItemText
                primaryTypographyProps={{ fontSize: '14px' }}
                primary="New Work Flow Config"
              />
            )}
          </ListItem>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{ fontSize: 14 }}>Purchase New</Typography>}
        </AccordionSummary>
        <AccordionDetails>

          <ListItem button component={RouterLink} to="/role/store-manager-dashboard">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Store" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/role/delivery-dashboard">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Delivery Management" />}
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