import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  Toolbar,
  Typography
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import { mainListItems as facultyMenu } from "./menucas1";
import { mainListItems as studentMenu } from "./menustud1";
import global1 from "./global1";

const drawerWidth = 250;

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

const DrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: { width: theme.spacing(9) }
    })
  }
}));

const theme = createTheme();

export default function MentoringLayout({ title, children, student = false }) {
  const [open, setOpen] = useState(true);
  const Menu = student ? studentMenu : facultyMenu;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBarStyled position="absolute" open={open}>
          <Toolbar sx={{ pr: 3 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen((value) => !value)}
              sx={{ mr: 4, ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            <Button color="inherit" component={RouterLink} to={student ? "/dashmclassenr1stud" : "/dashdashfacnew"}>
              Dashboard
            </Button>
          </Toolbar>
        </AppBarStyled>
        <DrawerStyled variant="permanent" open={open}>
          <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", px: [1] }}>
            <Typography variant="body1" noWrap sx={{ flexGrow: 1, ml: 1 }}>
              {global1.name}
            </Typography>
            <IconButton onClick={() => setOpen((value) => !value)}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List>{Menu({ open })}</List>
        </DrawerStyled>
        <Box
          component="main"
          sx={{
            backgroundColor: (muiTheme) => muiTheme.palette.mode === "light" ? muiTheme.palette.grey[100] : muiTheme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto"
          }}
        >
          <Toolbar />
          <Container maxWidth="xl" sx={{ py: 3 }}>
            {children}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
