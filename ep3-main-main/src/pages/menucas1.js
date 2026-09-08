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

import { menuitems } from './menufaculty';
import { menuitemshostel } from './menuhostel';
import { menuitemsexam } from './menuexam';
import { menuitemsall } from './menuall';
import { menuitemspurchase } from './menupurchase';

import { menuregistrar } from './menuregistrar';
import { menuhod } from './menuhod';
import { menuaccounts } from './menuaccounts';
import { menumanagement } from './menumanagement';
import { menubudget } from './menubudget';

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

const normalizeMenuText = (value) => String(value || '').trim().toLowerCase();

const flattenChildren = (children) => React.Children.toArray(children).filter(Boolean);

const getElementText = (node) => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (!React.isValidElement(node)) {
    return '';
  }
  if (typeof node.props?.primary === 'string') {
    return node.props.primary;
  }
  return flattenChildren(node.props?.children).map(getElementText).filter(Boolean).join(' ');
};

const findFirstPrimary = (node) => {
  if (!React.isValidElement(node)) {
    return '';
  }
  if (typeof node.props?.primary === 'string') {
    return node.props.primary;
  }
  for (const child of flattenChildren(node.props?.children)) {
    const text = findFirstPrimary(child);
    if (text) return text;
  }
  return '';
};

const collectListItems = (node, pages = []) => {
  if (!React.isValidElement(node)) {
    return pages;
  }
  if (node.props?.to) {
    pages.push({
      title: findFirstPrimary(node),
      path: node.props.to
    });
  }
  flattenChildren(node.props?.children).forEach((child) => collectListItems(child, pages));
  return pages;
};

const hasMenuAccess = (group, page, allowedKeys, allowedPaths, deniedKeys, deniedPaths) => {
  const groupKey = normalizeMenuText(group);
  const titleKey = normalizeMenuText(page.title);
  const pathKey = normalizeMenuText(page.path);
  const groupTitleKey = `${groupKey}|${titleKey}`;

  if (pathKey === '/menusearch') {
    return normalizeMenuText(global1.role) !== 'student';
  }

  if (deniedKeys.has(groupTitleKey) || deniedPaths.has(pathKey)) {
    return false;
  }

  return allowedKeys.has(groupTitleKey) || allowedPaths.has(pathKey);
};

const getDisplayGroup = (group, page, displayGroupsByKey, displayGroupsByPath) => {
  const groupKey = normalizeMenuText(group);
  const titleKey = normalizeMenuText(page.title);
  const pathKey = normalizeMenuText(page.path);
  return displayGroupsByPath.get(pathKey) || displayGroupsByKey.get(`${groupKey}|${titleKey}`) || group;
};

const replaceSummaryTitle = (summary, groupName) => {
  if (!React.isValidElement(summary)) return summary;
  const children = flattenChildren(summary.props?.children).map((child) => {
    if (React.isValidElement(child) && child.type === Typography) {
      return React.cloneElement(child, child.props, groupName);
    }
    return child;
  });
  return React.cloneElement(summary, summary.props, children);
};

const filterNode = (node, group, allowedKeys, allowedPaths, deniedKeys, deniedPaths, displayGroup, displayGroupsByKey, displayGroupsByPath) => {
  if (!React.isValidElement(node)) {
    return node;
  }

  if (node.props?.to) {
    const page = {
      title: findFirstPrimary(node),
      path: node.props.to
    };
    if (!hasMenuAccess(group, page, allowedKeys, allowedPaths, deniedKeys, deniedPaths)) return null;
    if (displayGroup && getDisplayGroup(group, page, displayGroupsByKey, displayGroupsByPath) !== displayGroup) return null;
    return node;
  }

  const children = flattenChildren(node.props?.children)
    .map((child) => filterNode(child, group, allowedKeys, allowedPaths, deniedKeys, deniedPaths, displayGroup, displayGroupsByKey, displayGroupsByPath))
    .filter(Boolean);

  return React.cloneElement(node, node.props, children);
};

const mergeAccordionDetails = (detailsList) => {
  const firstDetails = detailsList[0];
  if (!React.isValidElement(firstDetails)) return firstDetails;
  const mergedChildren = detailsList.flatMap((details) => flattenChildren(details.props?.children));
  return React.cloneElement(firstDetails, firstDetails.props, mergedChildren);
};

const filterMenuTree = (menuTree, allowedKeys, allowedPaths, deniedKeys, deniedPaths, displayGroupsByKey, displayGroupsByPath) => {
  if (!React.isValidElement(menuTree)) {
    return menuTree;
  }

  const groupedAccordions = new Map();
  flattenChildren(menuTree.props?.children)
    .forEach((accordion) => {
      if (!React.isValidElement(accordion)) {
        return;
      }

      const accordionChildren = flattenChildren(accordion.props?.children);
      const summary = accordionChildren[0];
      const details = accordionChildren[1];
      const group = getElementText(summary).trim();
      const filteredDetails = filterNode(details, group, allowedKeys, allowedPaths, deniedKeys, deniedPaths, "", displayGroupsByKey, displayGroupsByPath);
      const visiblePages = collectListItems(filteredDetails);

      if (!visiblePages.length) {
        return;
      }

      const displayGroups = Array.from(new Set(visiblePages.map((page) => getDisplayGroup(group, page, displayGroupsByKey, displayGroupsByPath))));
      displayGroups.forEach((displayGroup) => {
        const groupDetails = filterNode(details, group, allowedKeys, allowedPaths, deniedKeys, deniedPaths, displayGroup, displayGroupsByKey, displayGroupsByPath);
        if (!groupedAccordions.has(displayGroup)) {
          groupedAccordions.set(displayGroup, { accordion, summary, detailsList: [] });
        }
        groupedAccordions.get(displayGroup).detailsList.push(groupDetails);
      });
    });

  const accordions = Array.from(groupedAccordions.entries()).map(([displayGroup, item]) => (
    React.cloneElement(
      item.accordion,
      { ...item.accordion.props, key: displayGroup },
      [replaceSummaryTitle(item.summary, displayGroup), mergeAccordionDetails(item.detailsList)]
    )
  ));

  return React.cloneElement(menuTree, menuTree.props, accordions);
};

const MenuCas1FilteredTree = () => {
  const role = global1.role || '';
  const normalizedRole = normalizeMenuText(role);
  const [rules, setRules] = useState([]);

  useEffect(() => {
    if (normalizedRole === 'all' || normalizedRole === 'admin') {
      return;
    }

    const loadRules = async () => {
      try {
        const res = await ep1.get('/api/v2/menu-access', {
          params: { colid: global1.colid }
        });
        setRules(res.data?.data || []);
      } catch (err) {
        setRules([]);
      }
    };

    loadRules();
  }, [normalizedRole]);

  if (normalizedRole === 'all' || normalizedRole === 'admin') {
    return menuitemsall();
  }

  const { allowedKeys, allowedPaths, deniedKeys, deniedPaths, displayGroupsByKey, displayGroupsByPath } = rules.reduce((acc, rule) => {
    const ruleRole = normalizeMenuText(rule.role);
    if (ruleRole !== normalizedRole && ruleRole !== 'all') {
      return acc;
    }

    const key = `${normalizeMenuText(rule.menugroup)}|${normalizeMenuText(rule.title)}`;
    const path = normalizeMenuText(rule.path);
    const displayGroup = rule.groupname || rule.menugroup;

    if (normalizeMenuText(rule.access) === 'allow') {
      acc.allowedKeys.add(key);
      acc.allowedPaths.add(path);
      acc.displayGroupsByKey.set(key, displayGroup);
      acc.displayGroupsByPath.set(path, displayGroup);
    } else {
      acc.deniedKeys.add(key);
      acc.deniedPaths.add(path);
    }
    return acc;
  }, {
    allowedKeys: new Set(),
    allowedPaths: new Set(),
    deniedKeys: new Set(),
    deniedPaths: new Set(),
    displayGroupsByKey: new Map(),
    displayGroupsByPath: new Map()
  });

  return filterMenuTree(
    menuitemsall(),
    allowedKeys,
    allowedPaths,
    deniedKeys,
    deniedPaths,
    displayGroupsByKey,
    displayGroupsByPath
  );
};




export function mainListItems({ open }) {
  return (
    <div className="menucas1-menu-wrap" style={{overflowY: 'scroll', height: 600, width: 300, fontSize:10}}>
      <style>
        {`
          .menucas1-menu-wrap .MuiListItem-root {
            align-items: flex-start;
          }

          .menucas1-menu-wrap .MuiListItemIcon-root {
            min-width: 36px;
            margin-top: 4px;
          }

          .menucas1-menu-wrap .MuiListItemText-root {
            min-width: 0;
            margin-top: 6px;
            margin-bottom: 6px;
          }

          .menucas1-menu-wrap .MuiListItemText-primary {
            white-space: normal;
            overflow-wrap: anywhere;
            word-break: break-word;
            line-height: 1.25;
          }
        `}
      </style>
     
  
      {/* {content} */}

      <MenuCas1FilteredTree />


      
      
     

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
