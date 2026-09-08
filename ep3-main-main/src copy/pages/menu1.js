// src/listItems.js
import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalPoliceIcon  from '@mui/icons-material/LocalPolice';

export const mainListItems = (
    <div>
        <ListItem button component={RouterLink} to="/">
            <ListItemIcon>
                <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={RouterLink} to="/profile">
            <ListItemIcon>
                <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
        </ListItem>
        <ListItem button component={RouterLink} to="/learning-management-system">
            <ListItemIcon>
                <SchoolIcon />
            </ListItemIcon>
            <ListItemText
                primary={
                    <Typography component="span" variant="body3">
                        Learning management<br />System
                    </Typography>
                }
            />
        </ListItem>
        <ListItem button component={RouterLink} to="/dashmcas11">
            <ListItemIcon>
                <LocalPoliceIcon  />
            </ListItemIcon>
            <ListItemText primary="CAS Classes" />
        </ListItem>
        <ListItem button component={RouterLink} to="/dashmncas11">
            <ListItemIcon>
                <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Classes taken" />
        </ListItem>
        <ListItem button component={RouterLink} to="/reports">
            <ListItemIcon>
                <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Reports" />
        </ListItem>
    </div>
);

export const secondaryListItems = (
    <div>
        <ListSubheader inset>Saved reports</ListSubheader>
        <ListItem button>
            <ListItemIcon>
                <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Current month" />
        </ListItem>
        <ListItem button>
            <ListItemIcon>
                <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Last quarter" />
        </ListItem>
        <ListItem button>
            <ListItemIcon>
                <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Year-end sale" />
        </ListItem>
    </div>
);
