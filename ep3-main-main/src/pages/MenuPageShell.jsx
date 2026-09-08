import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  Toolbar,
  Typography
} from "@mui/material";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { mainListItems } from "./menucas1";
import { mainListItems as studentListItems } from "./menustud1";
import ActivityPointBadge from "./ActivityPointBadge";
import TopMenuSearch from "./TopMenuSearch";
import global1 from "./global1";

const drawerWidth = 250;
const theme = createTheme();
const menuStorageKey = "campus_menu_open";

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
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9)
      }
    })
  }
}));

export default function MenuPageShell({ title, children, menuType }) {
  const [open, setOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(menuStorageKey);
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(menuStorageKey, String(open));
    } catch {
      // Ignore storage errors and keep the in-memory drawer state.
    }
  }, [open]);

  const menuItems = menuType === "student" || String(global1.role || "").toLowerCase() === "student"
    ? studentListItems
    : mainListItems;

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBarStyled position="absolute" open={open}>
          <Toolbar sx={{ pr: "24px" }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(true)}
              sx={{ marginRight: "36px", ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            <TopMenuSearch menuType={menuType} />
            <ActivityPointBadge sx={{ mr: 2 }} />
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout} sx={{ whiteSpace: "nowrap" }}>
              Logout
            </Button>
          </Toolbar>
        </AppBarStyled>
        <DrawerStyled variant="permanent" open={open}>
          <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", px: [1] }}>
            <Typography component="h1" variant="body1" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              {global1.name}
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List>{menuItems({ open })}</List>
        </DrawerStyled>
        <Box component="main" sx={{ flexGrow: 1, height: "100vh", overflow: "auto", backgroundColor: "#f6f7fb" }}>
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
