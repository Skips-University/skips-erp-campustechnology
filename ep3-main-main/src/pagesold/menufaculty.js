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

export function menuitems () {

    const open=true;

  return (
    <div style={{overflowY: 'scroll', height: 600, width: 300, fontSize:10}}>
      <Accordion>
        <AccordionSummary aria-controls="panel1-content" id="panel1-header">
          <AccountCircleIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Personal CAS data</Typography>}
        </AccordionSummary>
        <AccordionDetails>

        <ListItem button component={RouterLink} to="/dashmprojects">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Projects" />}
</ListItem>
        <ListItem button component={RouterLink} to="/dashmpublications">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Publications" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmpatents">
<ListItemIcon>
<AcUnitIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Patents" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmteacherfellow">
<ListItemIcon>
<AccountBalanceWalletIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Fellowship and awards" style={{ overflow:'scroll'}} />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmconsultancy">
<ListItemIcon>
<AddTaskIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Consultancy" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmphdguide">
<ListItemIcon>
<AdjustIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="PhD Guideship" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmseminar">
<ListItemIcon>
<AutoModeIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Seminars participated" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmbook">
<ListItemIcon>
<ApprovalIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Books and chapters" />}
</ListItem>




          <ListItem button component={RouterLink} to="/dashmncas11">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Classes taken" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/dashmncas12">
            <ListItemIcon>
              <AutoStoriesIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Activities taken" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/dashmncas22">
            <ListItemIcon>
              <AutofpsSelectIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Publication (CAS)" />}
          </ListItem>

          <ListItem button component={RouterLink} to="/dashmncas241">
<ListItemIcon>
<BackupTableIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Research guidance" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmncas242">
<ListItemIcon>
<BathroomIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Completed Projects" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmncas243">
<ListItemIcon>
<BarChartIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Ongoing Projects" style={{ overflow:'scroll'}} />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmncas251">
<ListItemIcon>
<BalconyIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Patents" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmncas252">
<ListItemIcon>
<AvTimerIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Policy Document" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmncas26">
<ListItemIcon>
<Battery4BarIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Participation" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmncas253">
<ListItemIcon>
<BookIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="Awards or Fellowship" />}
</ListItem>


          <ListItem button component={RouterLink} to="/dashmncas23">
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            {open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="ICT (CAS)" />}
          </ListItem>




        </AccordionDetails>
      </Accordion>

  {/* <Accordion>
        <AccordionSummary aria-controls="panel4-content" id="panel4-header">
          <HostelIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Teaching Learning</Typography>}
        </AccordionSummary>
        <AccordionDetails>
        <ListItem button component={RouterLink} to="/dashmclassenr1">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Class enrollment" />}
</ListItem>


       
        </AccordionDetails>
      </Accordion> */}



      <Accordion>
        <AccordionSummary aria-controls="panel2-content" id="panel2-header">
          <SettingsIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Examination</Typography>}
        </AccordionSummary>
        <AccordionDetails>

      

<ListItem button component={RouterLink} to="/mainrubric">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Marks entry all" />}
</ListItem>

<ListItem button component={RouterLink} to="/rubricexampage1">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Marks entry all (2)" />}
</ListItem>


<ListItem button component={RouterLink} to="/examstructurepageds">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Exam configuration" />}
</ListItem>

<ListItem button component={RouterLink} to="/marksentrypageds">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Marks entry rubrics" />}
</ListItem>

<ListItem button component={RouterLink} to="/tabulationregisterpageds">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Tabulation register" />}
</ListItem>

<ListItem button component={RouterLink} to="/bulktabulationregisterpageds">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Tabulation register bulk" />}
</ListItem>

<ListItem button component={RouterLink} to="/transcriptpageds">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Examination Student Transcript" />}
</ListItem>




        </AccordionDetails>
      </Accordion>

         <Accordion>
              <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                <SettingsIcon sx={{ marginRight: 1 }} />
                {open && <Typography sx={{fontSize: 14}}>Question Bank</Typography>}
              </AccordionSummary>
              <AccordionDetails>
      
                 <ListItem button component={RouterLink} to="/questionbanklistds">
      <ListItemIcon>
      <PersonIcon />
      </ListItemIcon>
      {open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Question Bank" />}
      </ListItem>
      
      
      
              </AccordionDetails>
              </Accordion>

               <Accordion>
                      <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                        <SettingsIcon sx={{ marginRight: 1 }} />
                        {open && <Typography sx={{fontSize: 14}}>Reevaluation</Typography>}
                      </AccordionSummary>
                      <AccordionDetails>
              
                      
              
               <ListItem button component={RouterLink} to="/examinerevaluationds">
              <ListItemIcon>
              <PersonIcon />
              </ListItemIcon>
              {open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Examiner evaluation" />}
              </ListItem>
              
                      </AccordionDetails>
                    </Accordion>

       <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Student profile</Typography>}
        </AccordionSummary>
        <AccordionDetails>

            <ListItem button component={RouterLink} to="/dashstudprofileall">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student profile" />}
</ListItem>


        </AccordionDetails>
        </Accordion>

     

           <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Task assignment</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           {/* <ListItem button component={RouterLink} to="/taskmanager">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Task manager" />}
</ListItem> */}

<ListItem button component={RouterLink} to="/taskcreatorpage">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Create Task" />}
</ListItem>

<ListItem button component={RouterLink} to="/assigneetaskpage">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My Tasks" />}
</ListItem>

<ListItem button component={RouterLink} to="/approvertaskpage">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Approve Tasks" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

        <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                  <BusinessIcon sx={{ marginRight: 1 }} />
                  {open && <Typography sx={{fontSize: 14}}>CRM</Typography>}
                </AccordionSummary>
                <AccordionDetails>
        
                   <ListItem button component={RouterLink} to="/Dashmcrmh1">
        <ListItemIcon>
        <PersonIcon />
        </ListItemIcon>
        {open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="CRM Dashboard" />}
        </ListItem>
        
                </AccordionDetails>
                </Accordion>


         <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                  <BusinessIcon sx={{ marginRight: 1 }} />
                  {open && <Typography sx={{fontSize: 14}}>CO PO attainment</Typography>}
                </AccordionSummary>
                <AccordionDetails>
        
        
                  <ListItem button component={RouterLink} to="/dashmmcoatt">
        <ListItemIcon>
        <PersonIcon />
        </ListItemIcon>
        {open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Direct Attainment" />}
        </ListItem>
        
                 
        
          <ListItem button component={RouterLink} to="/feedbackinternalmanagement1">
        <ListItemIcon>
        <PersonIcon />
        </ListItemIcon>
        {open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Indirect Attainment" />}
        </ListItem>
        
        
        
        
                </AccordionDetails>
                </Accordion>

     

         <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>LMS</Typography>}
        </AccordionSummary>
        <AccordionDetails>
        <ListItem button component={RouterLink} to="/dashmmfaccourses">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My courses" />}
</ListItem>



{/* <ListItem button component={RouterLink} to="/videopage">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Video page" />}
</ListItem> */}

<ListItem button component={RouterLink} to="/dashmlmsvideos">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="AI Videos" />}
</ListItem>

{/* <ListItem button component={RouterLink} to="/dashmreactflow1">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Mind map" />}
</ListItem> */}


<ListItem button component={RouterLink} to="/dashmmindmaplist">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Mind map list" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmtimeslotsn1">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Time slot" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmworkloadn1">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Work load" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmfacwcal">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Faculty Workload Calendar" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmask1">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="AI NLP Knowledgebase questions" />}
</ListItem>

 <ListItem button component={RouterLink} to="/facultytopicpageds">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Course Forum" />}
</ListItem>


 {/* <ListItem button component={RouterLink} to="/dashmmindmapnodes">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Mind map nodes" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmindmapedges">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Mind map edges" />}
</ListItem> */}


{/* <ListItem button component={RouterLink} to="/dashmmcolevels">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Threshold Attainment levels" />}
</ListItem> */}
 {/* <ListItem button component={RouterLink} to="/dashmmfaccoursesatt">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="CO attainment" />}
</ListItem> */}
 {/* <ListItem button component={RouterLink} to="/dashmmattcalc">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="CO attainment" />}
</ListItem> */}

        </AccordionDetails>
      </Accordion>

        <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Academics</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/dashmmacadcal">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Academic calendar" />}
</ListItem>

           <ListItem button component={RouterLink} to="/dashmlessonplannew">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Lesson Plan" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

        <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Attendance and Schedule</Typography>}
        </AccordionSummary>
        <AccordionDetails>

            <ListItem button component={RouterLink} to="/classes">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Attendance" />}
</ListItem>


            <ListItem button component={RouterLink} to="/dashmclassnew">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Class schedule" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmclassnewc">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Class by date" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmattpcode">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Attendance report" />}
</ListItem>




        </AccordionDetails>
        </Accordion>

           <Accordion>
        <AccordionSummary aria-controls="panel1-content" id="panel1-header">
          <AccountCircleIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Forum</Typography>}
        </AccordionSummary>
        <AccordionDetails>

            <ListItem button component={RouterLink} to="/topiccategorypage1ds">
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
                {open && <Typography sx={{fontSize: 14}}>SERB DST Proposal</Typography>}
              </AccordionSummary>
              <AccordionDetails>

                 <ListItem button component={RouterLink} to="/dashmserbplan">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="SERB Timeline" />}
</ListItem>

  <ListItem button component={RouterLink} to="/dashmserb">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="SERB text" />}
</ListItem>



              </AccordionDetails>
              </Accordion>

                 <Accordion>
                      <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                        <BusinessIcon sx={{ marginRight: 1 }} />
                        {open && <Typography sx={{fontSize: 14}}>Feedback</Typography>}
                      </AccordionSummary>
                      <AccordionDetails>
              
                        <ListItem button component={RouterLink} to="/feedbackmanagement">
              <ListItemIcon>
              <PersonIcon />
              </ListItemIcon>
              {open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Manage feedback" />}
              </ListItem>
              
                <ListItem button component={RouterLink} to="/feedbackinternalmanagement">
              <ListItemIcon>
              <PersonIcon />
              </ListItemIcon>
              {open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Curriculum feedback" />}
              </ListItem>
              
              
              
              
                      </AccordionDetails>
                      </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Accreditation</Typography>}
        </AccordionSummary>
        <AccordionDetails>



           <ListItem button component={RouterLink} to="/dashmnn11">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.1 Outcome based curriculum" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn12">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.2 Stakeholder participation" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmmvac">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.3 Value added courses" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmnn14">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.4 Practical and Industry Focus" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn15">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.5 Practical and Skill Orientation" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn17">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.7 Curriculum revision" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn16">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.6 Online and Blended Learning" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmseminar">
<ListItemIcon>
<AutoModeIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="2.4.2 Seminars participated" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmbfacyear">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.4.3 Year wise faculty" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmnn211a">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.1 Recruitment committee" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn211b">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.1 Recruitment faculties" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn22">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.2 Pay and allowances" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn23">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.3 Faculty Diversity" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn244">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.4.4 Faculty participation in MOOC" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn25">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.5 Faculty Retention" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn26">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.6 Faculty Student Ratio" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn31">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="3.1 Physical Infrastructure" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn32">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="3.2 Library as learning resource" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmnn33a">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="3.3 IT Infrastructure" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn33b">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="3.3 and 3.4 Labs and Research Facilities" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn35">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="3.5 Divyangan Friendly Resources" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn36">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="3.6 Innovation Resources" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmbtrialb">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="4.1 4.2 4.3 4.4 4.5 Trial balance" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmnn46">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="4.6 Financial Risks and Controls" />}
</ListItem>


 <ListItem button component={RouterLink} to="/dashmnn51">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.1 Teaching pedagogy" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn52">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.2 Internship and field projects" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn53examdays">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.3 Exam days" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn53passp">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.3 Pass percentage" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn53obe">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.3 OBE Implementation" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn54">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.4 Grievance Management" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn55">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.5 Catering to diversity" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn56">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.6 LMS" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmbmou">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.7 Industry Academia Linkage" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmnn61">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="6.1 Club activities and technical festivals" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn62">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="6.2 Hackathon" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn6clubs">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="6.3 6.3 6.5 6.6 Club activities" />}
</ListItem>


 <ListItem button component={RouterLink} to="/dashmnn76">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="7.6 IQAC minutes" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn781">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="7.8 Inter University Collaboration" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn82">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="8.2 Academic Progression" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn83">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="8.3 Self Employment and Entrepreneurship" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn84">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="8.4 Competitive Exams" />}
</ListItem>
<ListItem button component={RouterLink} to="/dashmstudawardsnew">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="8.5 Student awards" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn86">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="8.6 Enrollment Percentage" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn87">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="8.7 Graduation" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmprojects">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="9.1 Research Grant Projects" />}
</ListItem>
        <ListItem button component={RouterLink} to="/dashmpublications">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="9.2 Publications" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmpatents">
<ListItemIcon>
<AcUnitIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="9.3 Research Quality Patents" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmconsultancy">
<ListItemIcon>
<AddTaskIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="9.3 Research Quality Consultancy" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmphdguide">
<ListItemIcon>
<AdjustIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="9.4 PhD Awarded" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmteacherfellow">
<ListItemIcon>
<AccountBalanceWalletIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: '14px'}} primary="9.5 Fellowship and awards" style={{ overflow:'scroll'}} />}
</ListItem>


 <ListItem button component={RouterLink} to="/dashmnn96">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="9.6 IPR Produced" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn97">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="9.7 Research Collaboration" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn98">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="9.8 Student Startup" />}
</ListItem>


 

 








      

        
 <ListItem button component={RouterLink} to="/dashmscholnew">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Scholarships" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmeventsnew1">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Events list 10.1 2.4.1 and others" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmpolicy">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Generate policies" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmqualitative">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Qualitative" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmhtmleditor">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="HTML template creator" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmgeotagtest">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Check geotag" />}
</ListItem>



<ListItem button component={RouterLink} to="/dashmmplacement">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Placement" />}
</ListItem>







{/* <ListItem button component={RouterLink} to="/campuswebsite">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Campus" />}
</ListItem> */}






        </AccordionDetails>
      </Accordion>

     

          <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Event registration</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/dashmeventsnew1">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="All events" />}
</ListItem> 

 <ListItem button component={RouterLink} to="/dasheventlistpage">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Manage registration" />}
</ListItem> 

           {/* <ListItem button component={RouterLink} to="/eventslist">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Event registration" />}
</ListItem>  */}

<ListItem button component={RouterLink} to={`/eventlistwithcolid/${global1.colid}`}>
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Website registration link" />}
</ListItem> 

        </AccordionDetails>
        </Accordion>

        

         <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Forms</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/forms">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Forms" />}
</ListItem> 

        </AccordionDetails>
        </Accordion>

         <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Leave management</Typography>}
        </AccordionSummary>
        <AccordionDetails>

        <ListItem button component={RouterLink} to="/dashleavesetup">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Leave Setup" />}
</ListItem> 

{/* <ListItem button component={RouterLink} to="/setuppage">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Setup" />}
</ListItem> */}

<ListItem button component={RouterLink} to="/leavespage">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Apply or Approve" />}
</ListItem>

{/* <ListItem button component={RouterLink} to="/navigatetopage">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Navigate" />}
</ListItem> */}

        </AccordionDetails>
        </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>NIRF Data</Typography>}
        </AccordionSummary>
        <AccordionDetails>

          <ListItem button component={RouterLink} to="/dashmstudgender">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student by gender" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmstudcategory">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student by category" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmstudquota">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student by quota" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashnirfplacement">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Placement report" />}
</ListItem>


 <ListItem button component={RouterLink} to="/dashmstudlist">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student count" />}
</ListItem>

        </AccordionDetails>
        </Accordion>


 <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Other Accreditation</Typography>}
        </AccordionSummary>
        <AccordionDetails>

       <ListItem button component={RouterLink} to="/dashmnallaccr">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Accreditation framework" />}
</ListItem>

</AccordionDetails>
 </Accordion>


      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Assets and Purchase</Typography>}
        </AccordionSummary>
        <AccordionDetails>

        <ListItem button component={RouterLink} to="/dashmmassets">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Asset register" />}
</ListItem>
 {/* <ListItem button component={RouterLink} to="/dashmmassetassign">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Asset assignment" />}
</ListItem> */}
 <ListItem button component={RouterLink} to="/dashmmvendors">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Vendor list" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmpurchase">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Purchase order" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmpurchaseitems">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="PO items" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmpopayments">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="PO payments" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmvendorbanks">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Vendor bank details" />}
</ListItem>



        </AccordionDetails>
        </Accordion>

        <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Groups</Typography>}
        </AccordionSummary>
        <AccordionDetails>


           <ListItem button component={RouterLink} to="/dashmngroup">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My Groups" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Settings</Typography>}
        </AccordionSummary>
        <AccordionDetails>

      

        <ListItem button component={RouterLink} to="/dashmquotanew">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="AI Credits" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashawsconfig">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="AWS config" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmpassword">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Change password" />}
</ListItem>

<ListItem button component={RouterLink} to="/signinpay">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Subscription" />}
</ListItem>



        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Test and Internship</Typography>}
        </AccordionSummary>
        <AccordionDetails>

        <ListItem button component={RouterLink} to="/dashmmtestnewm">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test list" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmminewm">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Internship" />}
</ListItem>

{/* <ListItem button component={RouterLink} to="/Dashtest1">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Internship" />}
</ListItem> */}

 {/* <ListItem button component={RouterLink} to="/dashmmtestsessions">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test sessions" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmtestseenrol">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test enroll" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmtestsections">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test sections" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmtestqnew">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test questions" />}
</ListItem> */}

      
       


        </AccordionDetails>
      </Accordion>


      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Journal</Typography>}
        </AccordionSummary>
        <AccordionDetails>
      
        <ListItem button component={RouterLink} to="/dashmlpublications">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Publications" />}
</ListItem>
<ListItem button component={RouterLink} to="/dashmlpublicationspublic">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Public Publications" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmlpubeditions">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Publication editions" />}
</ListItem>
 {/* <ListItem button component={RouterLink} to="/dashmlpubreviews">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Review comments" />}
</ListItem> */}
 <ListItem button component={RouterLink} to="/dashmlpubarticles">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Submit article" />}
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


<ListItem button component={RouterLink} to="/fullsubtractorcircuit">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Full subtractor circuit" />}
</ListItem>

{/* <ListItem button component={RouterLink} to="/fullsubcircuitverify">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Full subtractor circuit verify" />}
</ListItem> */}

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

<ListItem button component={RouterLink} to="/digitaltriradii">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Digital tritadii in anthropology" />}
</ListItem>

<ListItem button component={RouterLink} to="/fingerprintpatterns">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Finger print patterns" />}
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

<ListItem button component={RouterLink} to="/electricalmachinelab">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Electrical Machine Lab" />}
</ListItem>


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

<ListItem button component={RouterLink} to="/infraredgame">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Infra Red Game" />}
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
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Better aim" />}
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


