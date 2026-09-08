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
import { Typography} from '@mui/material';
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

import { menuitems } from './menufaculty';
import { menuitemshostel } from './menuhostel';
import { menuitemsexam } from './menuexam';
import { menuitemsall } from './menuall';
import { menuitemspurchase } from './menupurchase';

const getlink=()=>{
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




export function mainListItems({ open }) {

  const getitems=()=> {

   var role1=global1.role;

  if(role1=='Faculty') {
    return (
      <div>
        {menuitems()}
        {/* <menuitems /> */}
      </div>
    )

  } else if(role1=='Hostel') {
    return (
      <div>
        {menuitemshostel()}
        {/* <menuitems /> */}
      </div>
    )

  } else if(role1=='Exam') {
    return (
      <div>
        {menuitemsexam()}
        {/* <menuitems /> */}
      </div>
    )

  } else if(role1=='All') {
    return (
      <div>
        {menuitemsall()}
        {/* <menuitems /> */}
      </div>
    )

  } else if(role1=='Purchase') {
    return (
      <div>
        {menuitemspurchase()}
        {/* <menuitems /> */}
      </div>
    )

  }

}

  var content;

  var role=global1.role;

  if(role=='Faculty') {
    content=
    <div>
   
    </div>
    
  }





  return (
    <div style={{overflowY: 'scroll', height: 600, width: 300, fontSize:10}}>
     
  
      {/* {content} */}

      {getitems()}


      
      
     

      {/* <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography>Campus Management</Typography>}
        </AccordionSummary>
        <AccordionDetails>
          <ListItem button component={RouterLink} to="/departments">
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Departments" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/courses">
            <ListItemIcon>
              <LocalOfferIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Courses" />}
          </ListItem>
        </AccordionDetails>
      </Accordion> */}

      {/* <Accordion>
        <AccordionSummary aria-controls="panel4-content" id="panel4-header">
          <HostelIcon sx={{ marginRight: 1 }} />
          {open && <Typography>Hostel Management</Typography>}
        </AccordionSummary>
        <AccordionDetails>
          <ListItem button component={RouterLink} to="/hostel-room">
            <ListItemIcon>
              <HostelIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Hostel Room" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/hostel-room-types">
            <ListItemIcon>
              <HostelIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Hostel Room Types" />}
          </ListItem>
        </AccordionDetails>
      </Accordion> */}
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
