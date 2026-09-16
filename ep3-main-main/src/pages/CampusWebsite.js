import React from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const logoUrl = "https://skipsuniversity.edu.in/wp-content/uploads/2023/09/LOGO-2.png";
const colors = {
  gold: "#f9b142",
  navy: "#003c57",
  white: "#fdfdfe"
};

function CampusWebsite() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Login",
      description: "Access your campus workspace and continue where you left off.",
      path: "/Login",
      icon: LoginRoundedIcon,
      primary: true
    },
    {
      label: "Vendor Login",
      description: "Manage vendor activities, purchases and related services.",
      path: "/purchase-new-vendor-login",
      icon: StorefrontOutlinedIcon
    },
    {
      label: "Create Account",
      description: "Set up your account and start your digital campus journey.",
      path: "/signuppage",
      icon: PersonAddAltRoundedIcon
    }
  ];

  return (
    <Box
      sx={{
        "@keyframes float": {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -18px, 0)" }
        },
        "@keyframes pulse": {
          "0%, 100%": { opacity: 0.35, transform: "scale(1)" },
          "50%": { opacity: 0.6, transform: "scale(1.08)" }
        },
        position: "relative",
        overflow: "hidden",
        bgcolor: colors.white,
        color: colors.navy,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        "&::before": {
          content: '""',
          position: "absolute",
          width: { xs: 280, md: 520 },
          height: { xs: 280, md: 520 },
          top: { xs: 90, md: 40 },
          right: { xs: -140, md: -180 },
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.gold}, ${colors.white})`,
          animation: "pulse 8s ease-in-out infinite",
          pointerEvents: "none"
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: { xs: 220, md: 390 },
          height: { xs: 220, md: 390 },
          bottom: { xs: 100, md: -110 },
          left: { xs: -100, md: -90 },
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.navy}, ${colors.white})`,
          animation: "float 10s ease-in-out infinite",
          pointerEvents: "none"
        }
      }}
    >
      <CssBaseline />
      <AppBar
        position="relative"
        elevation={0}
        sx={{
          bgcolor: colors.white,
          borderBottom: `1px solid ${colors.navy}`,
          color: colors.navy,
          backdropFilter: "blur(14px)",
          zIndex: 2
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 62, md: 72 },
            px: { xs: 2, sm: 4, md: 7 },
            justifyContent: "center"
          }}
        >
          <Box component={RouterLink} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Box
              component="img"
              src={logoUrl}
              alt="SKIPS University"
              sx={{ width: { xs: 128, sm: 155, md: 175 }, maxHeight: 48, objectFit: "contain" }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          alignItems: "center",
          py: { xs: 2.5, sm: 3, md: 4 }
        }}
      >
        <Stack spacing={{ xs: 2.5, md: 3.5 }} width="100%" alignItems="center">
          <Stack spacing={{ xs: 1, md: 1.5 }} alignItems="center" textAlign="center">
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 1.2,
                py: 0.5,
                borderRadius: 10,
                bgcolor: colors.gold,
                color: colors.navy,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.2,
                textTransform: "uppercase"
              }}
            >
              <BusinessCenterOutlinedIcon sx={{ fontSize: 17 }} />
              Campus Technology
            </Box>
            <Typography
              component="h1"
              sx={{
                maxWidth: 580,
                fontSize: { xs: 27, sm: 36, md: 44 },
                lineHeight: 1.08,
                letterSpacing: 0,
                fontWeight: 900,
                color: colors.navy
              }}
            >
              Your campus journey starts here.
            </Typography>
            <Typography sx={{ maxWidth: 480, color: colors.navy, fontSize: { xs: 13, md: 15 }, lineHeight: 1.45 }}>
              Welcome to the SKIPS digital campus. Choose an option to continue.
            </Typography>
          </Stack>

          <Box
            sx={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: { xs: 1.25, sm: 1.5 }
            }}
          >
            {actions.map(({ label, description, path, icon: Icon, primary }) => (
              <Card
                key={label}
                role="button"
                tabIndex={0}
                onClick={() => navigate(path)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(path);
                  }
                }}
                sx={{
                  cursor: "pointer",
                  minHeight: { xs: 104, sm: 142 },
                  borderRadius: 2,
                  border: `2px solid ${colors.navy}`,
                  bgcolor: primary ? colors.navy : colors.white,
                  color: primary ? colors.white : colors.navy,
                  boxShadow: `0 6px 0 ${colors.gold}`,
                  transition: "transform 180ms ease, box-shadow 180ms ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 9px 0 ${colors.gold}`
                  }
                }}
              >
                <CardContent sx={{ height: "100%", p: { xs: 1.4, sm: 1.8 }, display: "flex", flexDirection: "column" }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: 1.2, display: "grid", placeItems: "center", bgcolor: colors.gold, color: colors.navy, mb: 1 }}>
                    <Icon />
                  </Box>
                  <Typography sx={{ fontSize: { xs: 15, sm: 16 }, fontWeight: 900, mb: 0.4 }}>{label}</Typography>
                  <Typography sx={{ color: primary ? colors.white : colors.navy, fontSize: { xs: 11, sm: 12 }, lineHeight: 1.35, flex: 1 }}>
                    {description}
                  </Typography>
                  <ArrowForwardIcon sx={{ mt: 0.8, fontSize: 17, color: primary ? colors.white : colors.navy }} />
                </CardContent>
              </Card>
            ))}
          </Box>
        </Stack>
      </Container>

      <Box component="footer" sx={{ position: "relative", zIndex: 1, borderTop: `1px solid ${colors.navy}`, bgcolor: colors.white, py: 1.2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center" justifyContent="center" sx={{ px: 2, textAlign: "center" }}>
          <MailOutlineRoundedIcon sx={{ color: colors.navy, fontSize: 17 }} />
          <Typography sx={{ color: colors.navy, fontSize: 12 }}>
            Need help? Mail us at{" "}
            <Button component="a" href="mailto:ops@skips.in" sx={{ minWidth: 0, p: 0, verticalAlign: "baseline", color: colors.navy, fontWeight: 800, textTransform: "none" }}>
              ops@skips.in
            </Button>
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export default CampusWebsite;
