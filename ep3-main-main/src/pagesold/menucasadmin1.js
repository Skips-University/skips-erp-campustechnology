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
    <div>
      <Accordion>
        <AccordionSummary aria-controls="panel1-content" id="panel1-header">
          <AccountCircleIcon sx={{ marginRight: 1 }} />
          {open && <Typography>Personal Data</Typography>}
        </AccordionSummary>
        <AccordionDetails>


        <ListItem button component={RouterLink} to="/dashmpublicationsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primary="Publications" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmpatentsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primary="Patents" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmteacherfellowadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primary="Fellowship and awards" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmconsultancyadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primary="Consultancy" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmphdguideadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primary="PhD Guideship" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmbookadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primary="Books and chapters" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmseminaradmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primary="Seminars participated" />}
</ListItem>



          <ListItem button component={RouterLink} to="/dashmncas11admin">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Classes taken" />}
          </ListItem>
          <ListItem button component={RouterLink} to="/dashmncas12admin">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            {open && <ListItemText primary="All activities" />}
          </ListItem>
          {/* <ListItem button component={RouterLink} to="/apply-leaves">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Apply Leaves" />}
          </ListItem> */}
        </AccordionDetails>
      </Accordion>


            <Accordion>
        <AccordionSummary aria-controls="panel2-content" id="panel2-header">
          <SettingsIcon sx={{ marginRight: 1 }} />
          {open && <Typography>User Management</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           {/* <ListItem button component={RouterLink} to="/dashmngroup">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="User Group" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmngrouppages">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Group Pages" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmngroupaccr">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Group Accreditation" />}
</ListItem>
 */}


   <ListItem button component={RouterLink} to="/dashmuser">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Users (Faculty)" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmcompany">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Company Users" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmroles">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Other roles" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmngroupadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="User Group" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmngrouppagesadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Group Pages" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmngroupaccradmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Group Accreditation" />}
</ListItem>



        </AccordionDetails>
        </Accordion>

        <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                  <BusinessIcon sx={{ marginRight: 1 }} />
                  {open && <Typography sx={{fontSize: 14}}>CRM</Typography>}
                </AccordionSummary>
                <AccordionDetails>
        
                   <ListItem button component={RouterLink} to="/Dashmcrmh1admin">
        <ListItemIcon>
        <PersonIcon />
        </ListItemIcon>
        {open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="CRM Dashboard" />}
        </ListItem>
        
                </AccordionDetails>
                </Accordion>

           <Accordion>
                <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                  <SettingsIcon sx={{ marginRight: 1 }} />
                  {open && <Typography sx={{fontSize: 14}}>Accounts</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                   <ListItem button component={RouterLink} to="/dashmmjournal2admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Journal" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmtrialbalance2admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Trial balanace" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmmtradingaccountadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Trading Account" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmplaccountadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="P&L Account" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmbalancesheetadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Balance Sheet" />}
</ListItem>


                </AccordionDetails>
                </Accordion>

        <Accordion>
                <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                  <SettingsIcon sx={{ marginRight: 1 }} />
                  {open && <Typography sx={{fontSize: 14}}>New registration</Typography>}
                </AccordionSummary>
                <AccordionDetails>
        
                  <ListItem button component={RouterLink} to="/generateinstitutecode">
        <ListItemIcon>
        <PersonIcon />
        </ListItemIcon>
        {open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Generate code" />}
        </ListItem>
        
                </AccordionDetails>
                </Accordion>

                 <Accordion>
        <AccordionSummary aria-controls="panel2-content" id="panel2-header">
          <SettingsIcon sx={{ marginRight: 1 }} />
          {open && <Typography>Digital Evaluation</Typography>}
        </AccordionSummary>
        <AccordionDetails>

            <ListItem button component={RouterLink} to="/dashmstudalloc1admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student list" />}
</ListItem>

        </AccordionDetails>
      </Accordion>
    
    <Accordion>
        <AccordionSummary aria-controls="panel2-content" id="panel2-header">
          <SettingsIcon sx={{ marginRight: 1 }} />
          {open && <Typography>Examination CoE</Typography>}
        </AccordionSummary>
        <AccordionDetails>


        <ListItem button component={RouterLink} to="/dashmmprogramsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Master Program List" />}
</ListItem>
<ListItem button component={RouterLink} to="/dashmmcourseslistadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Master course list offered" />}
</ListItem>


 <ListItem button component={RouterLink} to="/dashmmstudents1admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Master student list" />}
</ListItem>


          

        <ListItem button component={RouterLink} to="/dashmexamscheduleadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primary="Exam schedule" />}
</ListItem>
<ListItem button component={RouterLink} to="/dashmexamtimetableadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Exam time table" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmexamroomadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primary="Exam Seat allotment" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmexamadmitadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Exam registration" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmexammarksalladmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Exam marks" />}
</ListItem>


        </AccordionDetails>
      </Accordion>

   

        <Accordion>
        <AccordionSummary aria-controls="panel2-content" id="panel2-header">
          <SettingsIcon sx={{ marginRight: 1 }} />
          {open && <Typography>Fees</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/dashmfeesadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Fee configuration" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmledgerstudadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student Ledger" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmmfeescoladmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Fees collection" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

         <Accordion>
              <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                <BusinessIcon sx={{ marginRight: 1 }} />
                {open && <Typography sx={{fontSize: 14}}>Lesson plan</Typography>}
              </AccordionSummary>
              <AccordionDetails>
      
                 <ListItem button component={RouterLink} to="/dashmlessonplannewadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Lesson Plan" />}
</ListItem>

      
              </AccordionDetails>
              </Accordion>
    
      {/* 

      <Accordion>
        <AccordionSummary aria-controls="panel2-content" id="panel2-header">
          <SettingsIcon sx={{ marginRight: 1 }} />
          {open && <Typography>Quick test</Typography>}
        </AccordionSummary>
        <AccordionDetails>

        <ListItem button component={RouterLink} to="/dashmmtestnewmadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test list" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmminewmadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test list" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmisessionsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test sessions" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmiseenrol1admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student enrollment" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmisections1admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test sections" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmiqnewadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test questions" />}
</ListItem>


<ListItem button component={RouterLink} to="/dashmmtestseenrol1admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test enroll" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmtestsectionsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>

{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test sections" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmtestqnewadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test questions" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmtestsessionsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test sessions" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmtestscoresnewall">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Test score" />}
</ListItem>

    

        </AccordionDetails>
      </Accordion> */}


      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>LMS</Typography>}
        </AccordionSummary>
        <AccordionDetails>
           <ListItem button component={RouterLink} to="/dashmmacadcaladmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Academic calendar" />}
</ListItem>
        <ListItem button component={RouterLink} to="/dashmmassignmentsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Assignments" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmanouncementsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Announcement" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmcoursecoadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Course outcome" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmcalendaradmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Academic calendar" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmcoursematerialadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Course materials" />}
</ListItem>
<ListItem button component={RouterLink} to="/dashmclassnewadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Class schedule" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmlmsvideosadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="AI video" />}
</ListItem>


<ListItem button component={RouterLink} to="/dashmattendancenewadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Coursewise attendance" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmattyearadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Attainment Method 1" />}
</ListItem>


<ListItem button component={RouterLink} to="/dashmmindmaplistadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Mind map list" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmindmapnodesadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Mind map nodes" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmindmapedgesadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Mind map edges" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmtimeslotsn1admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Time slot" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmworkloadn1admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Work load" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmfacwcaladmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Faculty Workload Calendar" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmappmodel2">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Merit List All" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmappmodel2cat">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Merit List by Category" />}
</ListItem>






        </AccordionDetails>
      </Accordion>

       <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Settings</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/dashmjobapplicationdsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Application Status" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmjobdsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="All jobs" />}
</ListItem>


        </AccordionDetails>
        </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Settings</Typography>}
        </AccordionSummary>
        <AccordionDetails>
      

        <ListItem button component={RouterLink} to="/dashmquotanewadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Quota for user" />}
</ListItem>



        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Solved papers</Typography>}
        </AccordionSummary>
        <AccordionDetails>
      
        <ListItem button component={RouterLink} to="/dashmmguidesadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Solved questions" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmctalentregadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Talent exam registration" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmtestqnewcsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Question with image" />}
</ListItem>
<ListItem button component={RouterLink} to="/dashmonlinepayadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Online payment all" />}
</ListItem>




        </AccordionDetails>
      </Accordion>



  <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>CO attainment</Typography>}
        </AccordionSummary>
        <AccordionDetails>
        <ListItem button component={RouterLink} to="/dashmmfaccoursesadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My courses" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmfaccoursesattadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="CO attainment" />}
</ListItem>
<ListItem button component={RouterLink} to="/dashmmattcalcadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="CO attainment" />}
</ListItem>
<ListItem button component={RouterLink} to="/dashmmcolevelsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Threshold Attainment levels" />}
</ListItem>


        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Accreditation</Typography>}
        </AccordionSummary>
        <AccordionDetails>


           <ListItem button component={RouterLink} to="/dashmnn11admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.1 Outcome based curriculum" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn12admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.2 Stakeholder participation" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmmvacadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.3 Curriculum Flexibility VAC" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmnn14admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.4 Practical and Industry Focus" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn15admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.5 Practical and Skill Orientation" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn16admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.6 Online and Blended Learning" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn17admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="1.7 Curriculum revision" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmnn211aadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.1 Recruitment committee" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn211badmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.1 Recruitment faculties" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn22admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.2 Pay and allowances" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn23admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.3 Faculty Diversity" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn244admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.4.4 Faculty participation in MOOC" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn25admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.5 Faculty Retention" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn26admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="2.6 Faculty Student Ratio" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn31admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="3.1 Physical Infrastructure" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn32admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="3.2 Library as learning resource" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmnn33aadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="3.3 IT Infrastructure" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn33badmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="3.3 and 3.4 Labs and Research Facilities" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn35admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="3.5 Divyangan Friendly Resources" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn36admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="3.6 Innovation Resources" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn46admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="4.6 Financial Risks and Controls" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmnn51admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.1 Teaching pedagogy" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn52admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.2 Internship and field projects" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn53examdaysadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.3 Exam days" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn53passpadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.3 Pass percentage" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn53obeadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.3 OBE Implementation" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn54admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.4 Grievance Management" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn55admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.5 Catering to diversity" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn56admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.6 LMS" />}
</ListItem>

<ListItem button component={RouterLink} to="/dashmbmouadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="5.7 Industry Academia Linkage" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmnn61admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="6.1 Club activities and technical festivals" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn62admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="6.2 Hackathon" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn6clubsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="6.3 6.3 6.5 6.6 Club activities" />}
</ListItem>

 <ListItem button component={RouterLink} to="/dashmnn76admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="7.6 IQAC minutes" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn82admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="8.2 Academic Progression" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn781admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="7.8 Inter University Collaboration" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn83admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="8.3 Self Employment and Entrepreneurship" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn84admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="8.4 Competitive Exams" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn86admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="8.6 Enrollment Percentage" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn87admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="8.7 Graduation" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn96admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="9.6 IPR Produced" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn97admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="9.7 Research Collaboration" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmnn98admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="9.8 Student Startup" />}
</ListItem>





        <ListItem button component={RouterLink} to="/dashmeventsnew1admin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Events list" />}
</ListItem>

      

        <ListItem button component={RouterLink} to="/dashmstudawardsnewadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student awards" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmscholnewadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Scholarships" />}
</ListItem>



<ListItem button component={RouterLink} to="/dashmmplacementadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Placement" />}
</ListItem>



<ListItem button component={RouterLink} to="/dashmbtrialbadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Trial balance" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmbfacyearadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Year wise faculty" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmstudlistadmin">
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

           <ListItem button component={RouterLink} to="/dashmnallaccradmin">
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


        <ListItem button component={RouterLink} to="/dashmmassetsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Asset register" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmassetassignadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Asset assignment" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmvendorsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Vendor list" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmpurchaseadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Purchase order" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmpurchaseitemsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="PO items" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmvendorbanksadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Vendor bank details" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmmpopaymentsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="PO payments" />}
</ListItem>


        </AccordionDetails>
      </Accordion>


      <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Journal</Typography>}
        </AccordionSummary>
        <AccordionDetails>
      
        <ListItem button component={RouterLink} to="/dashmlpublicationsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Publications" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmlpubeditionsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Publication editions" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmlpubarticlesadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Submit article" />}
</ListItem>
 <ListItem button component={RouterLink} to="/dashmlpubreviewsadmin">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Review comments" />}
</ListItem>


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
