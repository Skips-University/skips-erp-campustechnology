import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SchoolIcon from "@mui/icons-material/School";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChatIcon from "@mui/icons-material/Chat";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GroupsIcon from "@mui/icons-material/Groups";
import HotelIcon from "@mui/icons-material/Hotel";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import PaymentsIcon from "@mui/icons-material/Payments";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ScienceIcon from "@mui/icons-material/Science";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import WorkIcon from "@mui/icons-material/Work";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import heroGraphic from "../assets/homepage-hero.svg";
import modulesGraphic from "../assets/homepage-modules.svg";

const drawerWidth = 270;
const logoUrl = "https://campus.technology/images/logo.png";

const navigation = [
  { label: "Home", href: "#home" },
  { label: "Modules", href: "#modules" },
  { label: "AI Examination", href: "#ai-exam" },
  { label: "Implementation", href: "#implementation" }
];

const quickLinks = [
  { label: "Faculty login", to: "/Login" },
  { label: "Student login", to: "/loginstud" },
  { label: "Vendor login", to: "/purchase-new-vendor-login" },
  { label: "Create account", to: "/signuppage" }
];

const modules = [
  {
    title: "Dashboard and Wizard",
    icon: DashboardIcon,
    color: "#2563eb",
    details: "Role-based dashboards, configuration wizard, setup progress, and quick access to critical ERP work."
  },
  {
    title: "Academic Configuration",
    icon: SettingsSuggestIcon,
    color: "#0f766e",
    details: "Programs, regulations, subjects, seat matrix, course map, syllabus, CO lists, assessment and grade rules."
  },
  {
    title: "Admission and CRM",
    icon: PersonSearchIcon,
    color: "#dc2626",
    details: "Dynamic admission forms, AI validation, CRM leads, counselor mapping, payments, receipts and admission-to-user flow."
  },
  {
    title: "NEP LMS",
    icon: LocalLibraryIcon,
    color: "#7c3aed",
    details: "Course workspace, AI material generation, assignments, quiz, attendance, remedial support and student dashboards."
  },
  {
    title: "Examination Marks",
    icon: FactCheckIcon,
    color: "#ea580c",
    details: "Assessment marks, componentwise processing, final marks, grade cards, relative grading and blockchain verification."
  },
  {
    title: "Conduct Examination",
    icon: AssignmentTurnedInIcon,
    color: "#0891b2",
    details: "Exam creation, course scheduler, seat allocation, invigilators, paper setting, moderation and on-screen marking."
  },
  {
    title: "Fees and Payment Gateway",
    icon: PaymentsIcon,
    color: "#16a34a",
    details: "Fee configuration, application, ledger, receipts, analytics, installments, Easebuzz and ICICI payment workflows."
  },
  {
    title: "HR, Salary and Leave",
    icon: WorkIcon,
    color: "#be123c",
    details: "Salary structure, payslips, attendance approval, leave hierarchy, leave dashboard, resignation and Form 16 support."
  },
  {
    title: "Purchase, Budget and Store",
    icon: Inventory2Icon,
    color: "#9333ea",
    details: "Budget planning, RFP, purchase orders, vendor mapping, stock, inward gate pass and new Purchase 2 CRUD module."
  },
  {
    title: "User Management",
    icon: GroupsIcon,
    color: "#475569",
    details: "Users, student upload, custom fields, menu access, user reports, promotion, cancellation and refund letters."
  },
  {
    title: "Research, BoS and Feedback",
    icon: ScienceIcon,
    color: "#0284c7",
    details: "Seed fund approvals, BoS course review, program review, feedback forms, AI sentiment and printable reports."
  },
  {
    title: "Hostel, Mentoring and Activities",
    icon: HotelIcon,
    color: "#ca8a04",
    details: "Hostel mapping, mentoring workspace, student activities, workload reports, ID cards and faculty cadra planning."
  },
  {
    title: "Recruitment and Placement",
    icon: BadgeIcon,
    color: "#db2777",
    details: "Recruitment forms, candidate validation, interview panels, placement leads, visit plans and lead stage tracking."
  },
  {
    title: "Transcription Meetings",
    icon: CalendarMonthIcon,
    color: "#4f46e5",
    details: "Meeting calendar, audio recording, AWS storage, Gemini transcript, translation, summary and printable minutes."
  },
  {
    title: "AI Helpdesk and Chatbot",
    icon: ChatIcon,
    color: "#059669",
    details: "Knowledgebase, public chatbot links, lead capture, AI configurations, Ollama settings and helpdesk automation."
  },
  {
    title: "Accreditation and Reports",
    icon: AccountTreeIcon,
    color: "#0e7490",
    details: "Academic audit, green audit, analytics, compliance evidence, printable reports and institutional documentation."
  }
];

const examCapabilities = [
  "Create examination timetables from plain text AI rules",
  "Respect holidays, weekends, slots and practical/theory constraints",
  "Allocate invigilators with AI rules and conflict checks",
  "Generate and moderate question papers using AI",
  "Support AI-assisted evaluation and on-screen marking",
  "Process absolute, relative, z-score and UGC grading"
];

const stats = [
  { value: "40+", label: "Integrated module areas" },
  { value: "AI", label: "Course, exam and workflow automation" },
  { value: "Role", label: "Faculty, student, admin and vendor views" },
  { value: "A4", label: "Printable reports and certificates" }
];

function CampusWebsite() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeDrawer = () => setMobileOpen(false);
  const openDrawer = () => setMobileOpen(true);

  const drawer = (
    <Box sx={{ width: drawerWidth }} role="presentation" onClick={closeDrawer}>
      <Box sx={{ p: 2.5 }}>
        <Box component="img" src={logoUrl} alt="Campus Technology" sx={{ width: 178, maxWidth: "100%" }} />
      </Box>
      <Divider />
      <List>
        {navigation.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component="a" href={item.href}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {quickLinks.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={RouterLink} to={item.to}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "#f7f9fc", color: "#111827", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: "rgba(255,255,255,0.92)", color: "#111827", backdropFilter: "blur(14px)", borderBottom: "1px solid #e5e7eb" }}>
        <Toolbar sx={{ minHeight: 72 }}>
          <IconButton edge="start" onClick={openDrawer} sx={{ display: { md: "none" }, mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Box component={RouterLink} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit", flexGrow: 1 }}>
            <Box component="img" src={logoUrl} alt="Campus Technology" sx={{ width: { xs: 150, md: 190 }, maxHeight: 52, objectFit: "contain" }} />
          </Box>
          <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            {navigation.map((item) => (
              <Button key={item.label} component="a" href={item.href} sx={{ color: "#334155" }}>
                {item.label}
              </Button>
            ))}
            <Button variant="outlined" onClick={() => navigate("/Login")}>Login</Button>
            <Button variant="outlined" onClick={() => navigate("/purchase-new-vendor-login")}>Vendor Login</Button>
            <Button variant="contained" onClick={() => navigate("/signuppage")}>Create Account</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer open={mobileOpen} onClose={closeDrawer} ModalProps={{ keepMounted: true }}>
        {drawer}
      </Drawer>

      <Box id="home" component="main" sx={{ pt: { xs: 11, md: 13 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center" sx={{ minHeight: { md: "calc(100vh - 120px)" }, pb: 6 }}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2.4}>
                <Chip
                  icon={<AutoAwesomeIcon />}
                  label="AI enabled ERP, LMS and Accreditation Management Software"
                  sx={{ alignSelf: "flex-start", bgcolor: "#e0f2fe", color: "#075985", fontWeight: 700 }}
                />
                <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: 38, md: 58, lg: 68 }, lineHeight: 1.03, letterSpacing: 0 }}>
                  India's first AI campus ERP with Blockchain and MCP Server.
                </Typography>
                <Typography variant="h6" sx={{ color: "#475569", maxWidth: 700, lineHeight: 1.65 }}>
                  Campus Technology brings academic administration, NEP LMS, AI-assisted examination, finance, HR, CRM, research, hostel, purchase and reporting into one connected workflow.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button size="large" variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/signuppage")}>
                    Start configuration
                  </Button>
                  <Button size="large" variant="outlined" onClick={() => navigate("/Login")}>
                    Login
                  </Button>
                  <Button size="large" variant="outlined" onClick={() => navigate("/purchase-new-vendor-login")}>
                    Vendor Login
                  </Button>
                </Stack>
                <Grid container spacing={1.5}>
                  {stats.map((item) => (
                    <Grid item xs={6} md={3} key={item.label}>
                      <PaperStat value={item.value} label={item.label} />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 28px 70px rgba(15, 23, 42, 0.18)",
                  bgcolor: "#fff",
                  p: { xs: 1, md: 2 }
                }}
              >
                <Box component="img" src={heroGraphic} alt="Campus ERP dashboard preview" sx={{ width: "100%", display: "block", borderRadius: 3 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>

        <Box id="modules" sx={{ bgcolor: "#fff", py: { xs: 6, md: 9 }, borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
          <Container maxWidth="xl">
            <Grid container spacing={3} alignItems="end" sx={{ mb: 3 }}>
              <Grid item xs={12} md={7}>
                <Typography variant="overline" sx={{ color: "#2563eb", fontWeight: 900 }}>Modules</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: 0 }}>
                  A connected digital campus for every department.
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: 18 }}>
                  Manage the full institution lifecycle from admissions to academics, learning, examinations, fees, HR, CRM, purchase, research, meetings and AI-supported services.
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box component="img" src={modulesGraphic} alt="Connected campus modules" sx={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 3 }} />
              </Grid>
            </Grid>
            <Grid container spacing={2.2}>
              {modules.map((item) => (
                <Grid item xs={12} sm={6} lg={3} key={item.title}>
                  <ModuleCard item={item} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box id="ai-exam" sx={{ py: { xs: 6, md: 9 }, bgcolor: "#0f172a", color: "#fff" }}>
          <Container maxWidth="xl">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={5}>
                <Chip label="New: AI-supported examination workflow" sx={{ bgcolor: "#22c55e", color: "#052e16", fontWeight: 900, mb: 2 }} />
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, letterSpacing: 0 }}>
                  Conduct examination with intelligent scheduling and assessment support.
                </Typography>
                <Typography sx={{ color: "#cbd5e1", fontSize: 18, lineHeight: 1.7 }}>
                  Use plain text instructions for exam timetable creation, invigilator allocation, question paper generation, AI evaluation and grading workflows.
                </Typography>
              </Grid>
              <Grid item xs={12} md={7}>
                <Grid container spacing={2}>
                  {examCapabilities.map((item, index) => (
                    <Grid item xs={12} sm={6} key={item}>
                      <Card sx={{ height: "100%", bgcolor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 3 }}>
                        <CardContent>
                          <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: index % 2 ? "#38bdf8" : "#34d399", color: "#04111f", display: "grid", placeItems: "center", fontWeight: 900 }}>
                              {index + 1}
                            </Box>
                            <Typography sx={{ fontWeight: 800, lineHeight: 1.45 }}>{item}</Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box id="implementation" sx={{ py: { xs: 6, md: 9 }, bgcolor: "#f8fafc" }}>
          <Container maxWidth="xl">
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FeatureBlock
                  icon={<SchoolIcon />}
                  title="Academic-first workflows"
                  text="Programs, regulation subjects, course maps, attendance, assessment, grade cards and BoS reviews work from the same academic structure."
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FeatureBlock
                  icon={<PsychologyIcon />}
                  title="AI where it matters"
                  text="Gemini, ChatGPT, Claude and Ollama options support content creation, validation, question paper review, syllabus assessment and meeting transcripts."
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FeatureBlock
                  icon={<ReceiptLongIcon />}
                  title="Printable and verifiable"
                  text="A4 reports, receipts, grade cards, orders, minutes, blockchain verification and QR links are built into the operational pages."
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FeatureBlock
                  icon={<CreditCardIcon />}
                  title="Payments and ledgers"
                  text="Admission fees, provisional fees, student ledger, counter payment, payment gateways and receipt generation are connected to finance reporting."
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FeatureBlock
                  icon={<Diversity3Icon />}
                  title="Role-sensitive portals"
                  text="Faculty, student, HR, vendor, counselor, examiner, paper setter and administrator pages are arranged around menu access controls."
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FeatureBlock
                  icon={<SupportAgentIcon />}
                  title="Implementation support"
                  text="Configuration wizard, bulk upload templates, AWS document storage and email configuration help institutions start fast and expand module by module."
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      <Box component="footer" sx={{ bgcolor: "#020617", color: "#cbd5e1", py: 5 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box component="img" src={logoUrl} alt="Campus Technology" sx={{ width: 190, bgcolor: "#fff", borderRadius: 2, p: 1, mb: 2 }} />
              <Typography sx={{ maxWidth: 560 }}>
                AI enabled ERP, LMS and Accreditation Management Software for institutions that want one operating system across academics and administration.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 900, color: "#fff", mb: 1 }}>Quick links</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {quickLinks.map((item) => (
                  <Button key={item.label} component={RouterLink} to={item.to} sx={{ color: "#bfdbfe" }}>
                    {item.label}
                  </Button>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography sx={{ fontWeight: 900, color: "#fff", mb: 1 }}>Contact</Typography>
              <Typography>support@campus.technology</Typography>
              <Typography sx={{ mt: 1 }}>Copyright @ 2026 Campus Technology</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

function PaperStat({ value, label }) {
  return (
    <Box sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", borderRadius: 2.5, p: 2, minHeight: 104 }}>
      <Typography sx={{ fontWeight: 900, fontSize: 26, color: "#0f172a" }}>{value}</Typography>
      <Typography sx={{ color: "#64748b", fontSize: 13, lineHeight: 1.35 }}>{label}</Typography>
    </Box>
  );
}

function ModuleCard({ item }) {
  const Icon = item.icon;
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.07)",
        overflow: "hidden"
      }}
    >
      <Box sx={{ height: 9, bgcolor: item.color }} />
      <CardContent sx={{ p: 2.4 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2.2, bgcolor: `${item.color}18`, color: item.color, display: "grid", placeItems: "center", mb: 2 }}>
          <Icon />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, letterSpacing: 0, minHeight: 58 }}>
          {item.title}
        </Typography>
        <Typography sx={{ color: "#64748b", lineHeight: 1.6 }}>
          {item.details}
        </Typography>
      </CardContent>
    </Card>
  );
}

function FeatureBlock({ icon, title, text }) {
  return (
    <Card sx={{ height: "100%", borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: "#e0f2fe", color: "#0369a1", display: "grid", placeItems: "center", mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ color: "#64748b", lineHeight: 1.7 }}>
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default CampusWebsite;
