import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Chip,
  ClickAwayListener,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  TextField,
  Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { menuitemsall } from "./menuall";
import { mainListItems as studentListItems } from "./menustud1";
import ep1 from "../api/ep1";
import global1 from "./global1";

const normalize = (value) => String(value || "").trim().toLowerCase();
const flattenChildren = (children) => React.Children.toArray(children).filter(Boolean);

const getElementText = (node) => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!React.isValidElement(node)) return "";
  if (typeof node.props?.primary === "string") return node.props.primary;
  return flattenChildren(node.props?.children).map(getElementText).filter(Boolean).join(" ");
};

const findFirstPrimary = (node) => {
  if (!React.isValidElement(node)) return "";
  if (typeof node.props?.primary === "string") return node.props.primary;
  for (const child of flattenChildren(node.props?.children)) {
    const text = findFirstPrimary(child);
    if (text) return text;
  }
  return "";
};

const collectPages = (node, group = "Menu", pages = []) => {
  if (!React.isValidElement(node)) return pages;
  if (node.props?.to) {
    const title = findFirstPrimary(node);
    if (title) pages.push({ group, title, path: node.props.to });
  }
  flattenChildren(node.props?.children).forEach((child) => collectPages(child, group, pages));
  return pages;
};

const extractGroupedPages = (tree) => {
  const rootChildren = flattenChildren(tree?.props?.children);
  const grouped = rootChildren.flatMap((item) => {
    if (!React.isValidElement(item)) return [];
    const children = flattenChildren(item.props?.children);
    const group = getElementText(children[0]).trim() || "Menu";
    return collectPages(children[1] || item, group);
  });
  if (grouped.length) return grouped;
  return collectPages(tree, "Menu");
};

const applyRoleAccess = (items, rules) => {
  const role = normalize(global1.role);
  if (role === "student" || role === "all" || role === "admin") return items;

  const allowedKeys = new Set();
  const allowedPaths = new Set();
  const deniedKeys = new Set();
  const deniedPaths = new Set();
  const displayGroupsByKey = new Map();
  const displayGroupsByPath = new Map();

  (rules || []).forEach((rule) => {
    const ruleRole = normalize(rule.role);
    if (ruleRole !== role && ruleRole !== "all") return;
    const key = `${normalize(rule.menugroup)}|${normalize(rule.title)}`;
    const path = normalize(rule.path);
    if (normalize(rule.access) === "allow") {
      allowedKeys.add(key);
      allowedPaths.add(path);
      if (rule.groupname) {
        displayGroupsByKey.set(key, rule.groupname);
        displayGroupsByPath.set(path, rule.groupname);
      }
    } else {
      deniedKeys.add(key);
      deniedPaths.add(path);
    }
  });

  return items.filter((item) => {
    const key = `${normalize(item.group)}|${normalize(item.title)}`;
    const path = normalize(item.path);
    if (deniedKeys.has(key) || deniedPaths.has(path)) return false;
    return allowedKeys.has(key) || allowedPaths.has(path) || path === "/menusearch";
  }).map((item) => {
    const key = `${normalize(item.group)}|${normalize(item.title)}`;
    const path = normalize(item.path);
    return {
      ...item,
      group: displayGroupsByPath.get(path) || displayGroupsByKey.get(key) || item.group
    };
  });
};

export default function TopMenuSearch({ menuType }) {
  const navigate = useNavigate();
  const anchorRef = useRef(null);
  const [query, setQuery] = useState("");
  const [rules, setRules] = useState([]);
  const [open, setOpen] = useState(false);
  const isStudent = menuType === "student" || normalize(global1.role) === "student";

  useEffect(() => {
    const role = normalize(global1.role);
    if (role === "all" || role === "admin" || role === "student") return;
    const loadRules = async () => {
      try {
        const res = await ep1.get("/api/v2/menu-access", { params: { colid: global1.colid } });
        setRules(res.data?.data || []);
      } catch {
        setRules([]);
      }
    };
    loadRules();
  }, []);

  const menuItems = useMemo(() => {
    const tree = isStudent ? studentListItems({ open: true }) : menuitemsall();
    const extracted = extractGroupedPages(tree).filter((item) => item.path && item.title);
    const unique = new Map();
    extracted.forEach((item) => {
      const key = `${item.path}|${item.title}`;
      if (!unique.has(key)) unique.set(key, item);
    });
    return applyRoleAccess([...unique.values()], rules);
  }, [isStudent, rules]);

  const results = useMemo(() => {
    const term = normalize(query);
    if (!term) return [];
    return menuItems
      .filter((item) => normalize(item.group).includes(term) || normalize(item.title).includes(term) || normalize(item.path).includes(term))
      .sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title))
      .slice(0, 12);
  }, [menuItems, query]);

  const close = () => setOpen(false);
  const go = (path) => {
    setQuery("");
    close();
    navigate(path);
  };

  return (
    <ClickAwayListener onClickAway={close}>
      <Box ref={anchorRef} sx={{ position: "relative", width: { xs: 180, sm: 260, md: 340 }, mr: 2 }}>
        <TextField
          size="small"
          value={query}
          placeholder="Search menu"
          onFocus={() => query && setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(Boolean(event.target.value));
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
            if (event.key === "Enter" && results[0]) go(results[0].path);
          }}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            sx: {
              bgcolor: "rgba(255,255,255,0.96)",
              borderRadius: 2,
              color: "#111827",
              "& input": { py: 0.9 }
            }
          }}
        />
        <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start" sx={{ zIndex: 2000, width: anchorRef.current?.offsetWidth || 340 }}>
          <Paper sx={{ mt: 1, maxHeight: 420, overflowY: "auto", boxShadow: "0 18px 45px rgba(15,23,42,0.24)", borderRadius: 2 }}>
            {!results.length ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">No matching menu links.</Typography>
              </Box>
            ) : (
              <List dense disablePadding>
                {results.map((item) => (
                  <ListItemButton key={`${item.path}-${item.title}`} onClick={() => go(item.path)} sx={{ alignItems: "flex-start", py: 1 }}>
                    <ListItemText
                      primary={<Typography fontWeight={800} fontSize={14}>{item.title}</Typography>}
                      secondary={(
                        <Box>
                          <Chip size="small" label={item.group || "Menu"} sx={{ mr: 0.75, height: 20, fontSize: 11 }} />
                          <Typography component="span" variant="caption" color="text.secondary">{item.path}</Typography>
                        </Box>
                      )}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
