import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  Box,
  Typography,
  Button,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";

const SideBar = () => {
  const [adminOpen, setAdminOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: "border-box",
          bgcolor: "grey.900",
          color: "white",
          p: 2,
        },
      }}
    >
      <Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Campus Canvas
        </Typography>

        <Button
          fullWidth
          variant="text"
          onClick={() => setAdminOpen(!adminOpen)}
          sx={{
            color: "white",
            justifyContent: "flex-start",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "grey.800",
            },
          }}
        >
          Application Links
        </Button>

        <Collapse in={adminOpen}>
          <List component="div" disablePadding>
            <ListItemButton
              component={Link}
              to="/admin/manage-links"
              selected={isActive("/admin/manage-links")}
              sx={{
                pl: 4,
                bgcolor: isActive("/admin/manage-links") ? "grey.800" : "inherit",
                "&:hover": {
                  bgcolor: "grey.800",
                },
              }}
            >
              <ListItemText primary="Manage Links" />
            </ListItemButton>
          </List>
        </Collapse>
      </Box>
    </Drawer>
  );
};

export default SideBar;

