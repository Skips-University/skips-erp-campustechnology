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
  return (
    <div style={{overflowY: 'scroll', height: 600, width: 300, fontSize:10}}>
      <Accordion>
        <AccordionSummary aria-controls="panel1-content" id="panel1-header">
          <AccountCircleIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Academics</Typography>}
        </AccordionSummary>
        <AccordionDetails>

        <ListItem button component={RouterLink} to="/dashmclassenr1stud">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My classes" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmclassnewstud">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Ongoing classes" />}
</ListItem>


   


        </AccordionDetails>
      </Accordion>

       <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>NEP Subject Selection</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/studentSubjectds">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Subject selection" />}
</ListItem>

          </AccordionDetails>
          </Accordion>

            <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>My Attendance</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/studentattendanceds">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My Attendance" />}
</ListItem>

        </AccordionDetails>
        </Accordion>


       <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Student data</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/student/profile">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My data" />}
</ListItem>


<ListItem button component={RouterLink} to="/studentprofiledsoct18">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My data edit" />}
</ListItem>

          </AccordionDetails>
          </Accordion>

           <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Hostel</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/dashboardhostelpagestud">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Hostel dashboard" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

          <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Scholarship</Typography>}
        </AccordionSummary>
        <AccordionDetails>

            <ListItem button component={RouterLink} to="/ApplyScholarshipDS">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Apply for scholarship" />}
</ListItem>


        </AccordionDetails>
        </Accordion>

       <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Fees Ledger</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/dashmledgerstudstud">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My Fees Ledger" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

          <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Certificates</Typography>}
        </AccordionSummary>
        <AccordionDetails>

          <ListItem button component={RouterLink} to="/studbonafide">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Bonafide certificate" />}
</ListItem>
<ListItem button component={RouterLink} to="/studadmission">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Admission letter" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

         <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Breakout rooms</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/studentclassview">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My rooms" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

          <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Discussion Board</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/studenttopicpageds">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Course Discussion" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

         <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Forum</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/studenttopicpage1ds">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="All Forum" />}
</ListItem>

        </AccordionDetails>
        </Accordion>


         <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Examination</Typography>}
        </AccordionSummary>
        <AccordionDetails>

          <ListItem button component={RouterLink} to="/dashapplyadmitstud">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student Registration form" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmexamadmitstud">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My registration" />}
</ListItem>

           {/* <ListItem button component={RouterLink} to="/examapplicationform">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student Registration form" />}
</ListItem> */}

         
{/* 
<ListItem button component={RouterLink} to="/downloadadmitcard">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Download admit card" />}
</ListItem> */}

<ListItem button component={RouterLink} to="/dashadmitdownload">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Download admit card" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmarksheet">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Download mark sheet" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

          <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Reevaluation</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/reevaluationapplicationds">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Apply" />}
</ListItem>

  <ListItem button component={RouterLink} to="/reevaluation-application-new">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Apply New" />}
</ListItem>



        </AccordionDetails>
        </Accordion>

          <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Placement</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/studentcv">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My CV" />}
</ListItem>

 <ListItem button component={RouterLink} to="/jobs-apply">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Apply for job" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="panel1-content" id="panel1-header">
          <AccountCircleIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>My data</Typography>}
        </AccordionSummary>
        <AccordionDetails>

     
        <ListItem button component={RouterLink} to="/dashmscholnewstud">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Scholarships" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmstudawardsnewstud">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student awards" />}
</ListItem>



        </AccordionDetails>
      </Accordion>


      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Settings</Typography>}
        </AccordionSummary>
        <AccordionDetails>
      

     

<ListItem button component={RouterLink} to="/dashmpasswordstud">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Change password" />}
</ListItem>



        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="panel1-content" id="panel1-header">
          <AccountCircleIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Virtual lab</Typography>}
        </AccordionSummary>
        <AccordionDetails>

        {/* <ListItem button component={RouterLink} to="/resistor">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Resistor" />}
</ListItem>
<ListItem button component={RouterLink} to="/bubblesort">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Bubblesort" />}
</ListItem>

<ListItem button component={RouterLink} to="/firstsimulator">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Logic Gate Simulator 1" />}
</ListItem>

<ListItem button component={RouterLink} to="/secondsimulator">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Logic Gate Simulator 2" />}
</ListItem> */}

<ListItem button component={RouterLink} to="/codeeditor">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Code editor" />}
</ListItem>

<ListItem button component={RouterLink} to="/subhalfadder1">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Half adder 1" />}
</ListItem>

<ListItem button component={RouterLink} to="/basiclogicgateexpfirst">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Logic gate 1" />}
</ListItem>

<ListItem button component={RouterLink} to="/basiclogicgateexpsecond">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Logic gate 2" />}
</ListItem>

<ListItem button component={RouterLink} to="/halfsubtractor">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Half Subtractor" />}
</ListItem>

<ListItem button component={RouterLink} to="/fullsubtractor">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Full Subtractor" />}
</ListItem>

<ListItem button component={RouterLink} to="/twobitadder">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Two bit adder" />}
</ListItem>

<ListItem button component={RouterLink} to="/fourbitaddersubtractor">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Four bit adder subtractor" />}
</ListItem>

<ListItem button component={RouterLink} to="/codl">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Characterization of digital logic" />}
</ListItem>

<ListItem button component={RouterLink} to="/insertionsort">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Insertion sort" />}
</ListItem>

<ListItem button component={RouterLink} to="/selectionsort">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Selection sort" />}
</ListItem>

<ListItem button component={RouterLink} to="/arrayvisualization">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Array visualization" />}
</ListItem>

<ListItem button component={RouterLink} to="/stackvisualization">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Stack visualization" />}
</ListItem>
   
<ListItem button component={RouterLink} to="/binaryarith">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Binary arithmetic" />}
</ListItem>

<ListItem button component={RouterLink} to="/queuevisual">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Queue visualization" />}
</ListItem>

<ListItem button component={RouterLink} to="/binarysearch">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Binary search" />}
</ListItem>


<ListItem button component={RouterLink} to="/binaryarithmetics">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Binary arithmetic 2" />}
</ListItem>

<ListItem button component={RouterLink} to="/notgate">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="NOT gate 1" />}
</ListItem>

<ListItem button component={RouterLink} to="/notgate2">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="NOT gate 2" />}
</ListItem>

<ListItem button component={RouterLink} to="/andgate">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="AND gate" />}
</ListItem>

<ListItem button component={RouterLink} to="/andgate2">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="AND gate 2" />}
</ListItem>

<ListItem button component={RouterLink} to="/orgate">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="OR gate" />}
</ListItem>

<ListItem button component={RouterLink} to="/orgate2">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="OR gate 2" />}
</ListItem>

<ListItem button component={RouterLink} to="/nandgate">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="NAND gate" />}
</ListItem>

<ListItem button component={RouterLink} to="/nandgate2">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="NAND gate 2" />}
</ListItem>

<ListItem button component={RouterLink} to="/norgate">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="NOR gate" />}
</ListItem>

<ListItem button component={RouterLink} to="/norgate2">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="NOR gate 2" />}
</ListItem>

<ListItem button component={RouterLink} to="/xorgate">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="XOR gate" />}
</ListItem>

<ListItem button component={RouterLink} to="/halfsubtractorcircuit">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Half subtractor circuit" />}
</ListItem>

<ListItem button component={RouterLink} to="/xnorgate">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="XNOR gate" />}
</ListItem>

<ListItem button component={RouterLink} to="/xnorgate2">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="XNOR gate 2" />}
</ListItem>

<ListItem button component={RouterLink} to="/xorgate2">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="XOR gate 2" />}
</ListItem>

{/* <ListItem button component={RouterLink} to="/fullsubtractorcircuit">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Full subtractor circuit" />}
</ListItem> */}

<ListItem button component={RouterLink} to="/fullsubcircuitverify">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Full subtractor circuit verify" />}
</ListItem>

<ListItem button component={RouterLink} to="/halfsubcircuitverify">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Half subtractor circuit" />}
</ListItem>

<ListItem button component={RouterLink} to="/bcdtoexcessconverter">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="BCD to excess converter" />}
</ListItem>

<ListItem button component={RouterLink} to="/bitserial">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Bit serial" />}
</ListItem>

<ListItem button component={RouterLink} to="/graytobinaryconverter">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Gray to binary converter" />}
</ListItem>

<ListItem button component={RouterLink} to="/stephanslaw">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Stephans law" />}
</ListItem>

<ListItem button component={RouterLink} to="/opticalfibre">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Optical fibre" />}
</ListItem>

<ListItem button component={RouterLink} to="/transformeroilstrength">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Transformer oil strength" />}
</ListItem>

<ListItem button component={RouterLink} to="/phasesequence">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Phase sequence" />}
</ListItem>

<ListItem button component={RouterLink} to="/dcshuntmotor">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="DC Shunt motor simulation" />}
</ListItem>

<ListItem button component={RouterLink} to="/skeletonexp">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Skeleton experiment 1" />}
</ListItem>

<ListItem button component={RouterLink} to="/titration">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Titration" />}
</ListItem>

<ListItem button component={RouterLink} to="/skeletonpart2">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Skeleton experiment 2" />}
</ListItem>

<ListItem button component={RouterLink} to="/infraredspectros">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Infra red spectroscopy with Salt Plates" />}
</ListItem>

{/* <ListItem button component={RouterLink} to="/phasesequence">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Phase sequence" />}
</ListItem> */}

        </AccordionDetails>
      </Accordion>
     
     
      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Virtual Lab Games</Typography>}
        </AccordionSummary>
        <AccordionDetails>
      
        <ListItem button component={RouterLink} to="/infraredspectros">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Infra red spectroscopy with Salt Plates" />}
</ListItem>

<ListItem button component={RouterLink} to="/skeletonpart2game">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Skeleton Games 2" />}
</ListItem>

<ListItem button component={RouterLink} to="/getmoldgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Get Mold" />}
</ListItem>

<ListItem button component={RouterLink} to="/opticalfibregame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Optical Fibre Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/digitaltriradiigame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Digital Triradii Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/transformeroilgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Transformer Oil Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/titrationgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Titration Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/bcdtoexcessgames">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="BCD to Excess Converter Game" />}
</ListItem>


<ListItem button component={RouterLink} to="/halfsubcircuitverifygame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Half sub circuit Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/fullsubcircuitverifygame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Full sub circuit verify Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/fullsubtractorcircuitgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Full subtractor circuit Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/graytobinaryconvertedgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Gray to Binary Converter Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/halfsubtractorcircuitgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Half subtractor circuit Game" />}
</ListItem>


<ListItem button component={RouterLink} to="/infraredgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Infra Red Game" />}
</ListItem>



<ListItem button component={RouterLink} to="/andgategame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="AND GATE Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/bitserialgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Bit Serial Game" />}
</ListItem>
     
<ListItem button component={RouterLink} to="/fingerprintpatterngames">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Finger Print Pattern Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/nandgategame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="NAND Gate Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/norgategame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="NOR Gate Game" />}
</ListItem>


<ListItem button component={RouterLink} to="/notgategame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="NOT Gate Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/orgategame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="OR Gate Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/skeletonexpgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Skeleton exp Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/stefanslawgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Stefan's law Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/subhalfadder1game">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Sub half adder Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/xnorgategame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="XNOR gate Game" />}
</ListItem>

<ListItem button component={RouterLink} to="/xorgategame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="XOR gate Game" />}
</ListItem>


<ListItem button component={RouterLink} to="/finddiff">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Difference game" />}
</ListItem>

<ListItem button component={RouterLink} to="/pacmangame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Pac man" />}
</ListItem>

<ListItem button component={RouterLink} to="/racegame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Race game" />}
</ListItem>

<ListItem button component={RouterLink} to="/wordguessing">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Word guessing" />}
</ListItem>

<ListItem button component={RouterLink} to="/imgpuzzle">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Image puzzle" />}
</ListItem>

<ListItem button component={RouterLink} to="/betteraimgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Better aim game" />}
</ListItem>

<ListItem button component={RouterLink} to="/tetrisgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Tetris game" />}
</ListItem>

{/* <ListItem button component={RouterLink} to="/dicegame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Dice game" />}
</ListItem> */}

<ListItem button component={RouterLink} to="/sudokugame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Sudoku game" />}
</ListItem>

<ListItem button component={RouterLink} to="/towerofhanoi">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Tower of Hanoi" />}
</ListItem>

<ListItem button component={RouterLink} to="/ultimatebattlegame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Ultimate battle game" />}
</ListItem>

{/* <ListItem button component={RouterLink} to="/mazegen">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Maze game" />}
</ListItem> */}



        </AccordionDetails>
      </Accordion>
     
     
     
     
      {/* <Accordion>
        <AccordionSummary aria-controls="panel2-content" id="panel2-header">
          <SettingsIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Examination CoE</Typography>}
        </AccordionSummary>
        <AccordionDetails>

        <ListItem button component={RouterLink} to="/dashmmprograms">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Master Program List" />}
</ListItem>
<ListItem button component={RouterLink} to="/dashmmcourseslist">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Master course list offered" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmmstudents1">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Master student list" />}
</ListItem>

        <ListItem button component={RouterLink} to="/dashmexamschedule">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Exam schedule" />}
</ListItem>
<ListItem button component={RouterLink} to="/dashmexamtimetable">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Exam time table" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmexamroom">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Exam Seat allotment" />}
</ListItem>


        </AccordionDetails>
      </Accordion> */}

         {/* <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>CO attainment</Typography>}
        </AccordionSummary>
        <AccordionDetails>
        <ListItem button component={RouterLink} to="/dashmmfaccourses">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My courses" />}
</ListItem>


        </AccordionDetails>
      </Accordion> */}

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
