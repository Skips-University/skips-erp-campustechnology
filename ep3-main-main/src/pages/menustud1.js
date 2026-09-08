import React, { useEffect, useState } from 'react';
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
import ep1 from '../api/ep1';
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

const getGroupIcon = (group = '') => {
  const value = String(group).toLowerCase();
  if (value.includes('dashboard')) return <DashboardIcon sx={{ marginRight: 1 }} />;
  if (value.includes('profile') || value.includes('data')) return <AccountCircleIcon sx={{ marginRight: 1 }} />;
  if (value.includes('fees')) return <AccountBalanceWalletIcon sx={{ marginRight: 1 }} />;
  if (value.includes('library')) return <BookIcon sx={{ marginRight: 1 }} />;
  if (value.includes('hostel')) return <HostelIcon sx={{ marginRight: 1 }} />;
  if (value.includes('exam')) return <AssignmentIcon sx={{ marginRight: 1 }} />;
  if (value.includes('setting')) return <SettingsIcon sx={{ marginRight: 1 }} />;
  return <BusinessIcon sx={{ marginRight: 1 }} />;
};

function RenderStudentGroups({ open, groups }) {
  return (
    <div style={{ overflowY: 'scroll', height: 600, width: 300, fontSize: 10 }}>
      {(groups || []).map((group, groupIndex) => (
        <Accordion key={`${group.group}-${groupIndex}`}>
          <AccordionSummary aria-controls={`student-custom-${groupIndex}`} id={`student-custom-${groupIndex}-header`}>
            {getGroupIcon(group.group)}
            {open && <Typography sx={{ fontSize: 14 }}>{group.group}</Typography>}
          </AccordionSummary>
          <AccordionDetails>
            {(group.items || []).map((item) => (
              <ListItem button component={RouterLink} to={item.path} key={item.path}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                {open && <ListItemText primaryTypographyProps={{ fontSize: "14px", whiteSpace: "normal" }} primary={item.title} />}
              </ListItem>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}

function StudentCustomMenuItems({ open }) {
  const [customGroups, setCustomGroups] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await ep1.get('/api/v2/student-custom-menu/effective', {
          params: {
            colid: global1.colid,
            user: global1.user,
            email: global1.email || global1.user,
            regno: global1.regno,
            academicyear: global1.academicyear,
            program: global1.program,
            programcode: global1.programcode
          }
        });
        const data = res.data?.custom ? (res.data?.data || []) : null;
        if (mounted) setCustomGroups(data && data.length ? data : null);
      } catch {
        if (mounted) setCustomGroups(null);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (customGroups?.length) {
    return <RenderStudentGroups open={open} groups={customGroups} />;
  }

  return <DefaultStudentListItems open={open} />;
}

export function mainListItems({ open }) {
  return <StudentCustomMenuItems open={open} />;
}

function DefaultStudentListItems({ open }) {
  return (
    <div style={{overflowY: 'scroll', height: 600, width: 300, fontSize:10}}>
      <Accordion>
        <AccordionSummary aria-controls="panel-dashboard-content" id="panel-dashboard-header">
          <DashboardIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Dashboard</Typography>}
        </AccordionSummary>
        <AccordionDetails>

        <ListItem button component={RouterLink} to="/studentdashboard">
<ListItemIcon>
<DashboardIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Student Dashboard" />}
</ListItem>

        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary aria-controls="panel-profile-content" id="panel-profile-header">
          <AccountCircleIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Profile</Typography>}
        </AccordionSummary>
        <AccordionDetails>

        <ListItem button component={RouterLink} to="/studentprofiledynamic">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Profile" />}
</ListItem>

        <ListItem button component={RouterLink} to="/studentcompleteprofile">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Complete profile" />}
</ListItem>

        <ListItem button component={RouterLink} to="/userdocumentupload">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Upload documents" />}
</ListItem>

        <ListItem button component={RouterLink} to="/studentbankaccounts">
<ListItemIcon>
<AccountBalanceWalletIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Bank account" />}
</ListItem>

        <ListItem button component={RouterLink} to="/studentlocationpublish">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Publish coordinates" />}
</ListItem>

        <ListItem button component={RouterLink} to="/studentlocationsearch">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Location search" />}
</ListItem>

        <ListItem button component={RouterLink} to="/studentadmissionprofile">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Admission profile" />}
</ListItem>

        <ListItem button component={RouterLink} to="/studentdynamicprofile">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Dynamic profile" />}
</ListItem>

        <ListItem button component={RouterLink} to="/userprofileprint">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Profile print" />}
</ListItem>

        <ListItem button component={RouterLink} to="/studentmentoringdetails">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Mentoring details" />}
</ListItem>

        <ListItem button component={RouterLink} to="/studentprofilelayoutdisplay">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Rolewise profile print" />}
</ListItem>

        <ListItem button component={RouterLink} to="/userconsent">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Give consent" />}
</ListItem>

        <ListItem button component={RouterLink} to="/userconsentwithdraw">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Withdraw consent" />}
</ListItem>

        </AccordionDetails>
      </Accordion>

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

       {/* <Accordion>
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
          </Accordion> */}

            {/* <Accordion>
        <AccordionSummary aria-controls="panel3-content" id="panel3-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>My Attendance</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/studentattendanceviewds">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My Attendance" />}
</ListItem>

        </AccordionDetails>
        </Accordion> */}

        <Accordion>
        <AccordionSummary aria-controls="panel-neplms-content" id="panel-neplms-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>NEP LMS</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/studentneplmsworkspace">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My NEP LMS" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentsequentialcontent">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Sequential Content" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentneplmsmindmaps">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Mind Maps" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentmyattendancesummary">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My Attendance Summary" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentneplmsotpattendance">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="OTP Attendance" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentneplmslivequiz">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Live quiz" />}
</ListItem>

           <ListItem button component={RouterLink} to="/continuous-feedback-student">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Class feedback" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentprereading">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Pre reading material" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentelectiveapplication">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Elective Application" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentmyelectives">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My Electives" />}
</ListItem>

            <ListItem button component={RouterLink} to="/studentneplmsassessment">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Assessment" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentneplmsremedial">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Remedial" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

        <Accordion>
        <AccordionSummary aria-controls="panel-student-online-exam-content" id="panel-student-online-exam-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Online examination</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/student-online-exam">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Online examination" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

        <Accordion>
        <AccordionSummary aria-controls="panel-student-mentoring-content" id="panel-student-mentoring-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Mentoring</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/studentmentoringworkspace">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="My mentoring" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentmentoringdetails">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Mentoring details" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

        <Accordion>
                <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                  <SettingsIcon sx={{ marginRight: 1 }} />
                  {open && <Typography sx={{ fontSize: 14 }}>Alumni interaction</Typography>}
                </AccordionSummary>
                <AccordionDetails>
        
                    <ListItem button component={RouterLink} to="/student/jobs">
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Job dashboard" />}
                  </ListItem>

                  <ListItem button component={RouterLink} to="/student/materials">
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Study material" />}
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

           <ListItem button component={RouterLink} to="/studenthostelbedapply">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Apply for hostel bed" />}
</ListItem>

        </AccordionDetails>
        </Accordion>

       <Accordion>
        <AccordionSummary aria-controls="panel-student-fees-payment-content" id="panel-student-fees-payment-header">
          <AccountBalanceWalletIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Fees payment</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/studentonlinefeepayment">
<ListItemIcon>
<AccountBalanceWalletIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Pay fees online" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentonlinefeepayment2">
<ListItemIcon>
<AccountBalanceWalletIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Pay fees online 2" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentmyonlinepaymentreport">
<ListItemIcon>
<AccountBalanceWalletIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="My online payments" />}
</ListItem>

           <ListItem button component={RouterLink} to="/studentinstallmentrequest">
<ListItemIcon>
<AccountBalanceWalletIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Apply installment" />}
</ListItem>

           {false && <ListItem button component={RouterLink} to="/studentdetailedledger">
<ListItemIcon>
<AccountBalanceWalletIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Detailed ledger" />}
</ListItem>}

           {false && <ListItem button component={RouterLink} to="/studentcounterfee2receipt">
<ListItemIcon>
<AccountBalanceWalletIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Counter fee receipt" />}
</ListItem>}

           {false && <ListItem button component={RouterLink} to="/studentfeesbalancereport">
<ListItemIcon>
<AccountBalanceWalletIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Fees balance report" />}
</ListItem>}

        </AccordionDetails>
        </Accordion>

       <Accordion>
        <AccordionSummary aria-controls="panel-student-library-new-content" id="panel-student-library-new-header">
          <BookIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Library New</Typography>}
        </AccordionSummary>
        <AccordionDetails>

           <ListItem button component={RouterLink} to="/student-library-issued">
<ListItemIcon>
<BookIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="My library books" />}
</ListItem>

           <ListItem button component={RouterLink} to="/student-library-opac">
<ListItemIcon>
<BookIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Search library OPAC" />}
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

            <ListItem button component={RouterLink} to="/studentscholarshipsuggestion">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Scholarship suggestion" />}
</ListItem>


        </AccordionDetails>
        </Accordion>

          <Accordion>
        <AccordionSummary aria-controls="panel-placement-new-student-content" id="panel-placement-new-student-header">
          <BusinessIcon sx={{ marginRight: 1 }} />
          {open && <Typography sx={{fontSize: 14}}>Placement new</Typography>}
        </AccordionSummary>
        <AccordionDetails>

            <ListItem button component={RouterLink} to="/student-placement-skills">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="My skills" />}
</ListItem>

            <ListItem button component={RouterLink} to="/student-placement-internships">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Internship projects" />}
</ListItem>

            <ListItem button component={RouterLink} to="/student-placement-sip">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="My SIP" />}
</ListItem>

            <ListItem button component={RouterLink} to="/student-placement-project-stages">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Project stages" />}
</ListItem>

            <ListItem button component={RouterLink} to="/student-placement-stage-details">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="Stage details" />}
</ListItem>

<ListItem button component={RouterLink} to="/student-placement-project-report">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px", whiteSpace: "normal"}} primary="SIP report" />}
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

          <ListItem button component={RouterLink} to="/student-exam-registration">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Exam registration" />}
</ListItem>

          <ListItem button component={RouterLink} to="/student-exam-dynamic-form">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Dynamic exam form" />}
</ListItem>

          <ListItem button component={RouterLink} to="/examapply">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Apply for exam" />}
</ListItem>

<ListItem button component={RouterLink} to="/examapply1">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Apply for exam 1" />}
</ListItem>

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

<ListItem button component={RouterLink} to="/student-admit-card-new">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Admit card new" />}
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

<ListItem button component={RouterLink} to="/studentpolicies">
<ListItemIcon>
<PersonIcon />
</ListItemIcon>
{open && <ListItemText primaryTypographyProps={{fontSize: "14px"}} primary="Policy" />}
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
