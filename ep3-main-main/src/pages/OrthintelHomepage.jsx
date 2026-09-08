import React, { useEffect } from "react";
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
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GroupsIcon from "@mui/icons-material/Groups";
import InsightsIcon from "@mui/icons-material/Insights";
import SchoolIcon from "@mui/icons-material/School";
import VerifiedIcon from "@mui/icons-material/Verified";

const navItems = [
  { label: "Platform", href: "#platform" },
  { label: "CODA Compliance", href: "#compliance" },
  { label: "For Programs", href: "#programs" }
];

const orthintelLogoUrl = "https://epaathsalagenai.s3.ap-southeast-2.amazonaws.com/orthintellogo.jpeg";

const featureCards = [
  {
    title: "Structured curriculum",
    text: "Build semesterwise modules, topics, lesson plans, assignments, quizzes and course material for every residency course.",
    icon: SchoolIcon
  },
  {
    title: "Competency tracking",
    text: "Map progress against outcomes, COs, assessments, attendance, case work and faculty review in one resident record.",
    icon: AutoGraphIcon
  },
  {
    title: "Case logging & sign-off",
    text: "Keep treatment milestones, documentation, approvals and mentor comments traceable for clinical review.",
    icon: AssignmentTurnedInIcon
  },
  {
    title: "Assessments & exams",
    text: "Create assessments, question papers, rubrics, AI evaluations, grading workflows and printable grade records.",
    icon: FactCheckIcon
  },
  {
    title: "Faculty evaluations",
    text: "Give faculty a clear workspace for mentoring, workload, submissions, student support and performance evidence.",
    icon: GroupsIcon
  },
  {
    title: "Accreditation reporting",
    text: "Prepare audit-ready summaries, evidence links, progress analytics and verifiable reports whenever review comes due.",
    icon: VerifiedIcon
  }
];

function BrandMark({ inverse = false }) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="center">
      <Box
        component="img"
        src={orthintelLogoUrl}
        alt="OrthIntel"
        sx={{
          width: 46,
          height: 46,
          borderRadius: 1.5,
          objectFit: "contain",
          bgcolor: "#fff",
          p: 0.4,
          boxShadow: "0 10px 22px rgba(8,167,181,0.18)"
        }}
      />
      <Typography sx={{ fontWeight: 950, fontSize: 24, color: inverse ? "#fff" : "#0f2f3a", letterSpacing: 0 }}>
        OrthIntel
      </Typography>
    </Stack>
  );
}

function ProgressRow({ label, value }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
        <Typography sx={{ fontWeight: 800, color: "#13333f" }}>{label}</Typography>
        <Typography sx={{ fontWeight: 900, color: "#087c8a" }}>{value}%</Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 9,
          borderRadius: 999,
          bgcolor: "#dceef1",
          "& .MuiLinearProgress-bar": { bgcolor: "#08a7b5", borderRadius: 999 }
        }}
      />
    </Box>
  );
}

export default function OrthintelHomepage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "OrthIntel";
    return () => {
      document.title = previousTitle || "Campus Technology";
    };
  }, []);

  return (
    <Box sx={{ bgcolor: "#f6fafb", color: "#132a33", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.96)",
          color: "#132a33",
          borderBottom: "1px solid #d9e8eb",
          backdropFilter: "blur(18px)"
        }}
      >
        <Toolbar sx={{ minHeight: 76, gap: 2 }}>
          <Box component={RouterLink} to="/orthintel-home" sx={{ textDecoration: "none", flexGrow: 1 }}>
            <BrandMark inverse />
          </Box>
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", lg: "flex" } }}>
            {navItems.map((item) => (
              <Button key={item.label} component="a" href={item.href} sx={{ color: "#36545d", fontWeight: 800 }}>
                {item.label}
              </Button>
            ))}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/Login" sx={{ color: "#0f2f3a", fontWeight: 900 }}>
              Sign in
            </Button>
            <Button
              component={RouterLink}
              to="/loginstud"
              variant="contained"
              sx={{ bgcolor: "#08a7b5", fontWeight: 900, "&:hover": { bgcolor: "#087c8a" } }}
            >
              Resident Login
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          bgcolor: "#0c3440",
          color: "#fff",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Container maxWidth="xl" sx={{ pt: { xs: 7, md: 9 }, pb: { xs: 4, md: 6 } }}>
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} lg={6.7}>
              <Stack spacing={3} sx={{ maxWidth: 780 }}>
                <Chip
                  label="CODA-COMPLIANT / COMPETENCY-BASED"
                  sx={{
                    alignSelf: "flex-start",
                    bgcolor: "rgba(8,167,181,0.18)",
                    color: "#a8f4fb",
                    border: "1px solid rgba(168,244,251,0.24)",
                    fontWeight: 950,
                    letterSpacing: 0.8
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 950,
                    fontSize: { xs: 42, sm: 54, md: 72 },
                    lineHeight: 1,
                    letterSpacing: 0
                  }}
                >
                  The intelligent LMS for Orthodontic Residency.
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: { xs: 18, md: 21 }, lineHeight: 1.65, maxWidth: 690 }}>
                  Deliver structured curriculum, track competencies against CODA standards, and prove resident progress - all in one platform built for orthodontic programs.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    size="large"
                    variant="contained"
                    component={RouterLink}
                    to="/Login"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ bgcolor: "#08a7b5", color: "#fff", fontWeight: 950, px: 3, "&:hover": { bgcolor: "#087c8a" } }}
                  >
                    Book a demo
                  </Button>
                  <Button
                    size="large"
                    variant="outlined"
                    component="a"
                    href="#platform"
                    sx={{ borderColor: "rgba(255,255,255,0.35)", color: "#fff", fontWeight: 900, px: 3 }}
                  >
                    See the platform
                  </Button>
                </Stack>
                <Grid container spacing={2} sx={{ pt: 1 }}>
                  {[
                    ["100%", "CODA-mapped curriculum"],
                    ["1 hub", "Learning + assessment"],
                    ["Any time", "Audit-ready reporting"]
                  ].map(([value, label]) => (
                    <Grid item xs={12} sm={4} key={label}>
                      <Typography sx={{ fontSize: 28, fontWeight: 950 }}>{value}</Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.64)", fontWeight: 750 }}>{label}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Grid>
            <Grid item xs={12} lg={5.3}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: { xs: 2.5, md: 3 },
                  bgcolor: "#f8fcfd",
                  color: "#132a33",
                  border: "1px solid rgba(255,255,255,0.45)",
                  boxShadow: "0 28px 80px rgba(0,0,0,0.32)"
                }}
              >
                <Stack spacing={2.4}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ color: "#61818a", fontSize: 12, fontWeight: 950, letterSpacing: 1.1 }}>
                        RESIDENT - COMPETENCY MAP
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 950, mt: 0.4 }}>
                        Progress dashboard
                      </Typography>
                    </Box>
                    <Chip label="Live" sx={{ bgcolor: "#d8f7ee", color: "#09735f", fontWeight: 900 }} />
                  </Stack>
                  <ProgressRow label="Diagnosis & Treatment Planning" value={86} />
                  <ProgressRow label="Biomechanics" value={72} />
                  <ProgressRow label="Surgical Orthodontics" value={64} />
                  <Divider />
                  <Grid container spacing={1.5}>
                    {[
                      ["Case log", "32 approved"],
                      ["Assessments", "14 complete"],
                      ["Mentor notes", "8 reviewed"],
                      ["Evidence", "Audit ready"]
                    ].map(([label, value]) => (
                      <Grid item xs={6} key={label}>
                        <Box sx={{ border: "1px solid #d7e7ea", borderRadius: 2, p: 1.5, bgcolor: "#fff" }}>
                          <Typography sx={{ color: "#6d8289", fontSize: 12, fontWeight: 850 }}>{label}</Typography>
                          <Typography sx={{ fontWeight: 950 }}>{value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        <Box sx={{ bgcolor: "#eef7f9", color: "#24434c", py: 2.5 }}>
          <Container maxWidth="xl">
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
              <Typography sx={{ fontWeight: 950, color: "#69828a", letterSpacing: 1 }}>BUILT FOR ACCREDITED PROGRAMS</Typography>
              <Stack direction="row" spacing={{ xs: 2, md: 4 }} flexWrap="wrap" useFlexGap>
                {["Graduate orthodontics", "Dental schools", "Residency clinics", "Academic health systems"].map((item) => (
                  <Typography key={item} sx={{ fontWeight: 900 }}>{item}</Typography>
                ))}
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Box id="platform" sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="xl">
          <Stack spacing={1.5} sx={{ mb: 4, maxWidth: 760 }}>
            <Typography variant="overline" sx={{ color: "#087c8a", fontWeight: 950 }}>Platform</Typography>
            <Typography variant="h2" sx={{ fontWeight: 950, fontSize: { xs: 34, md: 48 }, letterSpacing: 0 }}>
              Everything a residency program needs - in one place.
            </Typography>
          </Stack>
          <Grid container spacing={2.5}>
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <Grid item xs={12} sm={6} lg={4} key={feature.title}>
                  <Card sx={{ height: "100%", borderRadius: 2, border: "1px solid #d8e7ea", boxShadow: "0 12px 34px rgba(15,47,58,0.06)" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={1.6}>
                        <Box sx={{ width: 46, height: 46, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: "#e5f8fb", color: "#087c8a" }}>
                          <Icon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 950 }}>{feature.title}</Typography>
                        <Typography sx={{ color: "#5f747b", lineHeight: 1.7 }}>{feature.text}</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      <Box id="compliance" sx={{ bgcolor: "#102f3a", color: "#fff", py: { xs: 6, md: 9 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6.4}>
              <Stack spacing={2.2}>
                <Typography variant="overline" sx={{ color: "#7ee7ef", fontWeight: 950 }}>CODA Compliance</Typography>
                <Typography variant="h2" sx={{ fontWeight: 950, fontSize: { xs: 34, md: 48 }, letterSpacing: 0 }}>
                  Accreditation, without the scramble.
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: 18, lineHeight: 1.75 }}>
                  OrthIntel keeps curriculum, competencies, evaluations, resident progress and evidence organized as daily work happens, so accreditation reporting is a normal output of the platform.
                </Typography>
                {[
                  "Competency evidence connected to coursework, attendance, assessments and clinical activity.",
                  "Faculty sign-off, comments and approval history retained for review.",
                  "Printable, exportable and verifiable records for committees and external review."
                ].map((item) => (
                  <Stack key={item} direction="row" spacing={1.2} alignItems="flex-start">
                    <VerifiedIcon sx={{ color: "#7ee7ef", mt: 0.2 }} />
                    <Typography>{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={5.6}>
              <Paper elevation={0} sx={{ borderRadius: 3, p: 3, bgcolor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", color: "#fff" }}>
                <Typography sx={{ fontSize: 13, color: "#7ee7ef", fontWeight: 950, letterSpacing: 1 }}>ACCREDITATION READINESS</Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {[
                    ["Curriculum standards", "Mapped"],
                    ["Resident progress", "Current"],
                    ["Faculty review", "Documented"],
                    ["Evidence archive", "Ready"]
                  ].map(([label, value]) => (
                    <Stack key={label} direction="row" justifyContent="space-between" sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)" }}>
                      <Typography sx={{ color: "rgba(255,255,255,0.75)" }}>{label}</Typography>
                      <Typography sx={{ fontWeight: 950 }}>{value}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="programs" sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="xl">
          <Stack spacing={1.5} sx={{ mb: 4, textAlign: "center", alignItems: "center" }}>
            <Typography variant="overline" sx={{ color: "#087c8a", fontWeight: 950 }}>For Programs</Typography>
            <Typography variant="h2" sx={{ fontWeight: 950, fontSize: { xs: 34, md: 48 }, letterSpacing: 0 }}>
              One platform. Every stakeholder.
            </Typography>
          </Stack>
          <Grid container spacing={2.5}>
            {[
              ["Program directors", "View readiness, progression, compliance evidence, learning outcomes and institutional reporting."],
              ["Faculty & mentors", "Plan courses, create assessments, evaluate work, monitor attendance and guide residents."],
              ["Residents", "Access courses, assignments, quizzes, feedback, attendance, mentoring and verified academic records."]
            ].map(([title, text]) => (
              <Grid item xs={12} md={4} key={title}>
                <Card sx={{ height: "100%", borderRadius: 2, border: "1px solid #d8e7ea", boxShadow: "0 12px 34px rgba(15,47,58,0.05)" }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 950, mb: 1 }}>{title}</Typography>
                    <Typography sx={{ color: "#5f747b", lineHeight: 1.75 }}>{text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Paper elevation={0} sx={{ mt: 4, p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "#e9f8fa", border: "1px solid #cbe8ed" }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }}>
              <InsightsIcon sx={{ fontSize: 52, color: "#087c8a" }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 950, mb: 0.7 }}>
                  "The residency data finally tells the same story as the clinic."
                </Typography>
                <Typography sx={{ color: "#526d75" }}>
                  OrthIntel connects teaching, cases, assessment and reporting so progress is visible before the review meeting starts.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <Box component="footer" sx={{ bgcolor: "#08242d", color: "#fff", py: 4 }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
            <BrandMark />
            <Stack direction="row" spacing={1.5}>
              <Button component={RouterLink} to="/Login" variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}>
                Sign in
              </Button>
              <Button component={RouterLink} to="/loginstud" variant="contained" sx={{ bgcolor: "#08a7b5", "&:hover": { bgcolor: "#087c8a" } }}>
                Resident Login
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
